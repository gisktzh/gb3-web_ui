import {Injectable, isDevMode, inject} from '@angular/core';
import {OAuthErrorEvent, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {distinctUntilChanged, filter, interval, Subscription, tap} from 'rxjs';
import {environment} from '../../environments/environment';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../state/auth/actions/auth-status.actions';
import {AuthNotificationService} from './notifications/auth-notification.service';
import {Gb2UserInfo} from './interfaces/gb2-user-info.interface';
import {Router} from '@angular/router';
import {selectIsAuthenticated} from '../state/auth/reducers/auth-status.reducer';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly oauthService = inject(OAuthService);
  private readonly store = inject(Store);
  private readonly authNotificationService = inject(AuthNotificationService);
  private readonly router = inject(Router);

  private readonly isAuthenticatedCheckInterval$: Subscription = new Subscription();

  constructor() {
    if (!this.getAccessToken()) {
      // no token => the current user is definitely not logged in
      this.store.dispatch(AuthStatusActions.setInitialDataLoaded());
    }
    this.oauthService.events.subscribe((event) => {
      this.store.dispatch(AuthStatusActions.setStatus({isAuthenticated: this.oauthService.hasValidAccessToken()}));

      if (isDevMode()) {
        this.enableOauthDebug(event);
      }

      if (event.type === 'user_profile_loaded') {
        // the user profile is loaded and there is either a valid or invalid token
        this.store.dispatch(AuthStatusActions.setInitialDataLoaded());
      }
    });

    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(async () => {
      this.registerIsAuthenticatedHandler();
      this.registerImpendingLogoutHandler();
      if (this.oauthService.state) {
        await this.redirect(this.oauthService.state);
      }
    });
  }

  public login() {
    const currentUrl = this.router.url;
    this.oauthService.initCodeFlow(currentUrl);
  }

  /**
   * Programmatically log out a user. If isForced is true, also shows the forced logout dialog.
   * @param isForced
   */
  public logout(isForced: boolean) {
    if (isForced) {
      this.authNotificationService.showForcedLogoutDialog();
    } else {
      this.authNotificationService.showProgrammaticLogoutDialog();
    }

    this.store.dispatch(AuthStatusActions.setStatus({isAuthenticated: false}));
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  /**
   * Subscribe to the handler that periodically checks whether the token is still valid.
   *
   * Because we do not have a refresh token, the only event we get from the library is 'token_expires', but no event is raised when the
   * token actually expires. Hence, we poll within the specified interval and check whether the token is still valid. In the worst case,
   * the token is valid for the ping interval over its validity period OR less valid for the validity interval.
   *
   * In an ideal world, we could use the refresh event handler and listen to the events from the api itself.
   * @private
   */
  private registerIsAuthenticatedCheckIntervalHandler() {
    this.isAuthenticatedCheckInterval$.add(
      interval(environment.auth.authenticatedPingInterval)
        .pipe(
          tap((_) => {
            if (!this.oauthService.hasValidAccessToken()) {
              this.logout(true);
            }
          }),
        )
        .subscribe(),
    );
  }

  private unregisterIsAuthenticatedCheckIntervalHandler() {
    this.isAuthenticatedCheckInterval$.unsubscribe();
  }

  /**
   * Registers the handler for checking our login status.
   *
   * isAuthenticated$ is our main source of knowing whether or not we are logged in. As soon as it changes, we need to check what happened:
   * * If it is false, we need to logout (if we have a token) and unregister our ping handler
   * * If it is true, we need to register our ping handler
   *
   * In both cases, we also dispatch the current isAuthenticated status to our state, so our application knows whether we are logged in or
   * not.
   * @private
   */
  private registerIsAuthenticatedHandler() {
    this.store
      .select(selectIsAuthenticated)
      .pipe(
        distinctUntilChanged(),
        tap((isAuthenticated) => {
          return void (async () => {
            let userName = undefined;

            if (!isAuthenticated) {
              if (this.oauthService.getAccessToken()) {
                this.oauthService.logOut();
              }
              this.oauthService.stopAutomaticRefresh(); // see: https://github.com/manfredsteyer/angular-oauth2-oidc/issues/1080
              this.unregisterIsAuthenticatedCheckIntervalHandler();
            } else {
              this.registerIsAuthenticatedCheckIntervalHandler();
              userName = await this.getUserInfo();
            }

            this.store.dispatch(AuthStatusActions.setStatus({isAuthenticated, userName}));
          })();
        }),
      )
      .subscribe();
  }

  private async getUserInfo(): Promise<string> {
    const userInfo = (await this.oauthService.loadUserProfile()) as Gb2UserInfo;

    return userInfo.info.name;
  }

  private registerImpendingLogoutHandler() {
    this.oauthService.events
      .pipe(
        filter((event) => event.type === 'token_expires'),
        tap(() => {
          this.authNotificationService.showImpendingLogoutDialog();
        }),
      )
      .subscribe();
  }

  private enableOauthDebug(event: OAuthEvent) {
    if (event instanceof OAuthErrorEvent) {
      console.error('OAuthErrorEvent Object:', event);
    } else {
      //eslint-disable-next-line no-console -- Debugging OAuth events in development mode
      console.log('OAuthEvent Object:', event);
    }
  }

  private redirect(state: string): Promise<boolean> {
    const url = decodeURIComponent(state);
    return this.router.navigateByUrl(url);
  }
}
