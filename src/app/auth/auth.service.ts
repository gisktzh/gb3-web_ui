import {Injectable} from '@angular/core';
import {OAuthErrorEvent, OAuthService} from 'angular-oauth2-oidc';
import {BehaviorSubject, distinctUntilChanged, interval, tap} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public readonly isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  constructor(private readonly oauthService: OAuthService) {
    this.oauthService.events.subscribe((event) => {
      this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());

      if (event instanceof OAuthErrorEvent) {
        console.error('OAuthErrorEvent Object:', event);
      } else {
        console.warn('OAuthEvent Object:', event);
      }
    });

    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.registerIsAuthenticatedHandler();
      this.registerLogoutHandler();
    });
  }

  public login() {
    this.oauthService.initCodeFlow();
  }

  public logout() {
    this.isAuthenticatedSubject$.next(false);
  }

  /**
   * This handler sets the ping to check whether the token is still valid.
   *
   * Because we do not have a refresh token, the only event we get from the library is 'token_expires', but no event is raised when the
   * token actually expires. Hence, we poll within the specified interval and check whether the token is still valid. In the worst case,
   * the token is valid for the ping interval over its validity period OR less valid for the validity interval.
   *
   * In an ideal world, we could use the refresh event handler and listen to the events from the api itself.
   * @private
   */
  private registerIsAuthenticatedHandler() {
    interval(environment.auth.authenticatedPingInterval)
      .pipe(
        tap((_) => {
          console.log(`in ping, ${this.oauthService.hasValidAccessToken()}`);
          this.isAuthenticatedSubject$.next(this.oauthService.hasValidAccessToken());
        })
      )
      .subscribe();
  }

  private registerLogoutHandler() {
    this.isAuthenticated$
      .pipe(
        distinctUntilChanged(),
        tap((isAuthenticated) => {
          console.log('in logout handler');
          if (!isAuthenticated) {
            console.log('trigger logout');
            this.oauthService.logOut();
          }
        })
      )
      .subscribe();
  }
}
