import {TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {OAuthEvent, OAuthService, OAuthSuccessEvent} from 'angular-oauth2-oidc';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {SharedModule} from '../shared/shared.module';
import {Observable, Subject, Subscription} from 'rxjs';
import {AuthNotificationService} from './notifications/auth-notification.service';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {AuthStatusActions} from '../state/auth/actions/auth-status.actions';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {Router} from '@angular/router';
import {selectIsAuthenticated} from '../state/auth/reducers/auth-status.reducer';
import {Mock} from 'vitest';
import {Procedure} from '@vitest/spy';

type OAuthEventSubscribeCallback = (event: OAuthEvent) => void;

type MockOAuthService = {
  configure: Mock;
  hasValidAccessToken: Mock;
  loadDiscoveryDocument: Mock;
  loadDiscoveryDocumentAndLogin: Mock;
  loadDiscoveryDocumentAndTryLogin: Mock;
  loadUserProfile: Mock<Procedure>;
  restartSessionChecksIfStillLoggedIn: Mock;
  setupAutomaticSilentRefresh: Mock;
  silentRefresh: Mock;
  stopAutomaticRefresh: Mock;
  tryLogin: Mock;
  tryLoginCodeFlow: Mock;
  tryLoginImplicitFlow: Mock;
  logOut: Mock;
  getAccessToken: Mock;
  initCodeFlow: Mock;
  events: Observable<OAuthEvent>;
  state: string;
};

const mockAuthNotificationService: Partial<AuthNotificationService> = {
  showImpendingLogoutDialog: vi.fn().mockReturnValue(void 0),
  showForcedLogoutDialog: vi.fn().mockReturnValue(void 0),
  showProgrammaticLogoutDialog: vi.fn().mockReturnValue(void 0),
};

describe('AuthService', () => {
  let service: AuthService;
  let store: MockStore;
  let router: Router;
  let mockOAuthService: MockOAuthService;
  let mockOAuthEvents: Observable<OAuthEvent>;

  beforeEach(() => {
    mockOAuthEvents = new Subject<OAuthEvent>().asObservable();

    mockOAuthService = {
      configure: vi.fn().mockReturnValue(void 0),
      hasValidAccessToken: vi.fn().mockReturnValue(false),
      loadDiscoveryDocument: vi.fn().mockReturnValue(Promise.resolve(new OAuthSuccessEvent('discovery_document_loaded'))),
      loadDiscoveryDocumentAndLogin: vi.fn().mockReturnValue(Promise.resolve(false)),
      loadDiscoveryDocumentAndTryLogin: vi.fn().mockReturnValue(Promise.resolve(false)),
      loadUserProfile: vi.fn().mockReturnValue(Promise.resolve({})),
      restartSessionChecksIfStillLoggedIn: vi.fn().mockReturnValue(void 0),
      setupAutomaticSilentRefresh: vi.fn().mockReturnValue(void 0),
      silentRefresh: vi.fn().mockReturnValue(Promise.resolve(new OAuthSuccessEvent('silently_refreshed'))),
      stopAutomaticRefresh: vi.fn().mockReturnValue(void 0),
      tryLogin: vi.fn().mockReturnValue(Promise.resolve(false)),
      tryLoginCodeFlow: vi.fn().mockReturnValue(Promise.resolve()),
      tryLoginImplicitFlow: vi.fn().mockReturnValue(Promise.resolve(false)),
      logOut: vi.fn().mockReturnValue(void 0),
      getAccessToken: vi.fn().mockReturnValue(''),
      initCodeFlow: vi.fn().mockReturnValue(void 0),
      events: mockOAuthEvents,
      state: '',
    };

    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        provideMockStore({}),
        {provide: AuthNotificationService, useValue: mockAuthNotificationService},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: OAuthService, useValue: mockOAuthService},
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockImplementation(vi.fn());

    store = TestBed.inject(MockStore);
  });

  describe('construction', () => {
    it('should dispatch that initial data was loaded if no access token was given', () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');
      const oauthServiceGetAccessTokenSpy = mockOAuthService.getAccessToken.mockReturnValue('');

      service = TestBed.inject(AuthService);

      expect(oauthServiceGetAccessTokenSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setInitialDataLoaded());
    });

    it('should not dispatch that initial data was loaded if a token was given', () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');
      const oauthServiceGetAccessTokenSpy = mockOAuthService.getAccessToken.mockReturnValue('test-token');

      service = TestBed.inject(AuthService);

      expect(oauthServiceGetAccessTokenSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch that initial data was loaded if the user profile was loaded', () => {
      mockOAuthService.getAccessToken.mockReturnValue('');
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');
      const oauthHasValidAccessToken = mockOAuthService.hasValidAccessToken.mockReturnValue(true);
      const oauthServiceEventSubscriberSpy = vi
        .spyOn(mockOAuthService.events, 'subscribe')
        .mockImplementationOnce((callback: OAuthEventSubscribeCallback | null | undefined) => {
          if (callback) {
            callback(new OAuthSuccessEvent('session_changed'));

            expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: true}));
            expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setInitialDataLoaded());
            expect(oauthHasValidAccessToken).toHaveBeenCalled();
          }

          return new Subscription();
        });

      service = TestBed.inject(AuthService);

      expect(oauthServiceEventSubscriberSpy).toHaveBeenCalled();
    });

    it('should not dispatch that initial data was loaded if the user profile was not loaded yet', () => {
      mockOAuthService.getAccessToken.mockReturnValue('test_token');
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');
      const oauthHasValidAccessToken = mockOAuthService.hasValidAccessToken.mockReturnValue(true);
      const oauthServiceEventSubscriberSpy = vi
        .spyOn(mockOAuthService.events, 'subscribe')
        .mockImplementationOnce((callback: OAuthEventSubscribeCallback | null | undefined) => {
          if (callback) {
            callback(new OAuthSuccessEvent('session_changed'));

            expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: true}));
            expect(storeDispatchSpy).not.toHaveBeenCalledWith(AuthStatusActions.setInitialDataLoaded());
            expect(oauthHasValidAccessToken).toHaveBeenCalled();
          }

          return new Subscription();
        });

      service = TestBed.inject(AuthService);

      expect(oauthServiceEventSubscriberSpy).toHaveBeenCalled();
    });

    it('should load disovery document and try to log and not redirect if the oauth state is falsy', async () => {
      vi.useFakeTimers();

      const loadDiscoveryDocumentAndTryLoginSpy = mockOAuthService.loadDiscoveryDocumentAndTryLogin.mockReturnValue(Promise.resolve(true));
      mockOAuthService.state = '';

      service = TestBed.inject(AuthService);

      await vi.runAllTimersAsync();

      expect(loadDiscoveryDocumentAndTryLoginSpy).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should load disovery document and try to log and redirect if the oauth state is truthy', async () => {
      vi.useFakeTimers();

      const loadDiscoveryDocumentAndTryLoginSpy = mockOAuthService.loadDiscoveryDocumentAndTryLogin.mockReturnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';

      service = TestBed.inject(AuthService);

      await vi.runAllTimersAsync();

      expect(loadDiscoveryDocumentAndTryLoginSpy).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('success');

      vi.useRealTimers();
    });

    it('should attach the authenticated handler properly and react to a truthy isAuthenticated value and empty user info appropriately', async () => {
      vi.useFakeTimers();

      mockOAuthService.loadDiscoveryDocumentAndTryLogin.mockReturnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = vi.spyOn(store, 'select').mockReturnValue(isAuthenticated$.asObservable());
      const oauthLoadUserProfileSpy = mockOAuthService.loadUserProfile.mockResolvedValue({info: undefined});
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');

      service = TestBed.inject(AuthService);

      await Promise.resolve();

      isAuthenticated$.next(true);

      await Promise.resolve();
      await Promise.resolve();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(oauthLoadUserProfileSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledWith(
        AuthStatusActions.setStatus({isAuthenticated: true, userName: undefined, userEmail: undefined}),
      );

      vi.useRealTimers();
    });

    it('should attach the authenticated handler properly and react to a truthy isAuthenticated value and present user info appropriately', async () => {
      vi.useFakeTimers();

      mockOAuthService.loadDiscoveryDocumentAndTryLogin.mockReturnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = vi.spyOn(store, 'select').mockReturnValue(isAuthenticated$.asObservable());
      const oauthLoadUserProfileSpy = mockOAuthService.loadUserProfile.mockResolvedValue({
        info: {name: 'hello world', email: 'hello@wor.ld'},
      });
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');

      service = TestBed.inject(AuthService);

      await Promise.resolve();

      isAuthenticated$.next(true);

      await Promise.resolve();
      await Promise.resolve();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(oauthLoadUserProfileSpy).toHaveBeenCalled();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        AuthStatusActions.setStatus({isAuthenticated: true, userName: 'hello world', userEmail: 'hello@wor.ld'}),
      );

      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should attach the authenticated handler properly and react to a falsy isAuthenticated value appropriately and attempt a logout if an access token is present', async () => {
      vi.useFakeTimers();

      mockOAuthService.loadDiscoveryDocumentAndTryLogin.mockReturnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = vi.spyOn(store, 'select').mockReturnValue(isAuthenticated$.asObservable());
      const oauthGetAccessTokenSpy = mockOAuthService.getAccessToken.mockReturnValue('test-token');

      service = TestBed.inject(AuthService);
      await Promise.resolve();

      isAuthenticated$.next(false);

      await Promise.resolve();
      await Promise.resolve();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(mockOAuthService.loadUserProfile).not.toHaveBeenCalled();
      expect(oauthGetAccessTokenSpy).toHaveBeenCalled();
      expect(mockOAuthService.logOut).toHaveBeenCalled();
      expect(mockOAuthService.stopAutomaticRefresh).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should attach the authenticated handler properly and react to a falsy isAuthenticated value appropriately and not attempt a logout if no access token is present', async () => {
      vi.useFakeTimers();

      mockOAuthService.loadDiscoveryDocumentAndTryLogin.mockReturnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = vi.spyOn(store, 'select').mockReturnValue(isAuthenticated$.asObservable());
      const oauthGetAccessTokenSpy = mockOAuthService.getAccessToken.mockReturnValue('');

      service = TestBed.inject(AuthService);

      await Promise.resolve();

      isAuthenticated$.next(false);

      await Promise.resolve();
      await Promise.resolve();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(mockOAuthService.loadUserProfile).not.toHaveBeenCalled();
      expect(oauthGetAccessTokenSpy).toHaveBeenCalled();
      expect(mockOAuthService.logOut).not.toHaveBeenCalled();
      expect(mockOAuthService.stopAutomaticRefresh).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('login', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('initializes code flow', () => {
      service.login();

      expect(mockOAuthService.initCodeFlow).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('shows dialog for forced logout and sets isAuthenticated', () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');

      service.logout(true);

      expect(mockAuthNotificationService.showForcedLogoutDialog).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: false}));
    });

    it('shows dialog for programmatic logout and sets isAuthenticated', () => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');

      service.logout(false);

      expect(mockAuthNotificationService.showProgrammaticLogoutDialog).toHaveBeenCalledTimes(1);
      expect(storeDispatchSpy).toHaveBeenCalledTimes(1);
      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: false}));
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('returns the access token from OAuthService', () => {
      const expectedResult = 'test-token';
      mockOAuthService.getAccessToken.mockReturnValue(expectedResult);

      const result = service.getAccessToken();

      expect(result).toEqual(expectedResult);
    });
  });
});
