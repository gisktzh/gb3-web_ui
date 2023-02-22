import {Injectable, isDevMode} from '@angular/core';
import {OAuthErrorEvent, OAuthEvent, OAuthService} from 'angular-oauth2-oidc';
import {BehaviorSubject, distinctUntilChanged, filter, interval, Subscription, tap} from 'rxjs';
import {environment} from '../../environments/environment';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../state/auth/actions/auth-status.actions';
import {AuthNotificationService} from './notifications/auth-notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();
  private readonly isAuthenticatedCheckInterval$: Subscription = new Subscription();

  constructor(
    private readonly oauthService: OAuthService,
    private readonly store: Store,
    private readonly authNotificationService: AuthNotificationService
  ) {
    this.oauthService.events.subscribe((event) => {
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

      if (isDevMode()) {
        this.enableOauthDebug(event);
      }
    });

    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.registerIsAuthenticatedHandler();
      this.registerImpendingLogoutHandler();
    });
  }

  public login() {
    this.oauthService.initCodeFlow();
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

    this.isAuthenticatedSubject$.next(false);
  }

  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  /**
   * Subscribe or unsubscribe to the handler that periodically checks whether the token is still valid.
   *
   * Because we do not have a refresh token, the only event we get from the library is 'token_expires', but no event is raised when the
   * token actually expires. Hence, we poll within the specified interval and check whether the token is still valid. In the worst case,
   * the token is valid for the ping interval over its validity period OR less valid for the validity interval.
   *
   * In an ideal world, we could use the refresh event handler and listen to the events from the api itself.
   * @private
   */
  private registerIsAuthenticatedCheckIntervalHandler(subscribe: boolean) {
    if (subscribe) {
      this.isAuthenticatedCheckInterval$.add(
        interval(environment.auth.authenticatedPingInterval)
          .pipe(
            tap((_) => {
              if (!this.oauthService.hasValidAccessToken()) {
                this.logout(true);
              }
            })
          )
          .subscribe()
      );
    } else {
      this.isAuthenticatedCheckInterval$.unsubscribe();
    }
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
    this.isAuthenticated$
      .pipe(
        distinctUntilChanged(),
        tap((isAuthenticated) => {
          if (!isAuthenticated) {
            if (this.oauthService.getAccessToken()) {
              this.oauthService.logOut();
            }
            this.oauthService.stopAutomaticRefresh(); // see: https://github.com/manfredsteyer/angular-oauth2-oidc/issues/1080
            this.registerIsAuthenticatedCheckIntervalHandler(false);
          } else {
            this.registerIsAuthenticatedCheckIntervalHandler(true);
          }

          this.store.dispatch(AuthStatusActions.setStatus({isAuthenticated}));
        })
      )
      .subscribe();
  }

  private registerImpendingLogoutHandler() {
    this.oauthService.events
      .pipe(
        filter((event) => event.type === 'token_expires'),
        tap(() => {
          this.authNotificationService.showImpendingLogoutDialog();
        })
      )
      .subscribe();
  }

  private enableOauthDebug(event: OAuthEvent) {
    if (event instanceof OAuthErrorEvent) {
      console.error('OAuthErrorEvent Object:', event);
    } else {
      console.warn('OAuthEvent Object:', event);
    }
  }
}
