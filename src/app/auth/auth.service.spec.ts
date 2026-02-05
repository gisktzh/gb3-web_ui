import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {AuthService} from './auth.service';
import {OAuthEvent, OAuthService, OAuthSuccessEvent} from 'angular-oauth2-oidc';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {SharedModule} from '../shared/shared.module';
import {Subject, Subscription} from 'rxjs';
import {AuthNotificationService} from './notifications/auth-notification.service';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {AuthStatusActions} from '../state/auth/actions/auth-status.actions';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {Router} from '@angular/router';
import {selectIsAuthenticated} from '../state/auth/reducers/auth-status.reducer';

type OAuthEventSubscribeCallback = (event: OAuthEvent) => void;

const mockAuthNotificationService = jasmine.createSpyObj<AuthNotificationService>({
  showImpendingLogoutDialog: void 0,
  showForcedLogoutDialog: void 0,
  showProgrammaticLogoutDialog: void 0,
});
describe('AuthService', () => {
  let service: AuthService;
  let mockOAuthEvents: Subject<OAuthEvent>;
  let mockOAuthService: jasmine.SpyObj<OAuthService>;
  let store: MockStore;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockOAuthEvents = new Subject<OAuthEvent>();
    mockOAuthService = jasmine.createSpyObj<OAuthService>(
      {
        configure: void 0,
        hasValidAccessToken: false,
        loadDiscoveryDocument: Promise.resolve(new OAuthSuccessEvent('discovery_document_loaded')),
        loadDiscoveryDocumentAndLogin: Promise.resolve(false),
        loadDiscoveryDocumentAndTryLogin: Promise.resolve(false),
        loadUserProfile: Promise.resolve({}),
        restartSessionChecksIfStillLoggedIn: void 0,
        setupAutomaticSilentRefresh: void 0,
        silentRefresh: Promise.resolve(new OAuthSuccessEvent('silently_refreshed')),
        stopAutomaticRefresh: void 0,
        tryLogin: Promise.resolve(false),
        tryLoginCodeFlow: Promise.resolve(void 0),
        tryLoginImplicitFlow: Promise.resolve(false),
        logOut: void 0,
        getAccessToken: '',
        initCodeFlow: void 0,
      },
      {
        events: mockOAuthEvents.asObservable(),
      },
    );
    router = jasmine.createSpyObj<Router>('', ['navigateByUrl']);
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        provideMockStore({}),
        {provide: OAuthService, useValue: mockOAuthService},
        {provide: AuthNotificationService, useValue: mockAuthNotificationService},
        {provide: Router, useValue: router},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    store = TestBed.inject(MockStore);
  });

  describe('construction', () => {
    it('should dispatch that initial data was loaded if no access token was given', () => {
      const storeDispatchSpy = spyOn(store, 'dispatch');
      const oauthServiceGetAccessTokenSpy = mockOAuthService.getAccessToken.and.returnValue('');

      service = TestBed.inject(AuthService);

      expect(oauthServiceGetAccessTokenSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setInitialDataLoaded());
    });

    it('should not dispatch that initial data was loaded if a token was given', () => {
      const storeDispatchSpy = spyOn(store, 'dispatch');
      const oauthServiceGetAccessTokenSpy = mockOAuthService.getAccessToken.and.returnValue('test-token');

      service = TestBed.inject(AuthService);

      expect(oauthServiceGetAccessTokenSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).not.toHaveBeenCalled();
    });

    it('should dispatch that initial data was loaded if the user profile was loaded', () => {
      mockOAuthService.getAccessToken.and.returnValue('');
      const storeDispatchSpy = spyOn(store, 'dispatch');
      const oauthHasValidAccessToken = mockOAuthService.hasValidAccessToken.and.returnValue(true);
      const oauthServiceEventSubscriberSpy = spyOn(mockOAuthService.events, 'subscribe').and.callFake(
        (callback: OAuthEventSubscribeCallback) => {
          callback(new OAuthSuccessEvent('user_profile_loaded'));

          expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: true}));
          expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setInitialDataLoaded());
          expect(oauthHasValidAccessToken).toHaveBeenCalled();

          return new Subscription();
        },
      );

      service = TestBed.inject(AuthService);

      expect(oauthServiceEventSubscriberSpy).toHaveBeenCalled();
    });

    it('should not dispatch that initial data was loaded if the user profile was not loaded yet', () => {
      mockOAuthService.getAccessToken.and.returnValue('test_token');
      const storeDispatchSpy = spyOn(store, 'dispatch');
      const oauthHasValidAccessToken = mockOAuthService.hasValidAccessToken.and.returnValue(true);
      const oauthServiceEventSubscriberSpy = spyOn(mockOAuthService.events, 'subscribe').and.callFake(
        (callback: OAuthEventSubscribeCallback) => {
          callback(new OAuthSuccessEvent('session_changed'));

          expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: true}));
          expect(storeDispatchSpy).not.toHaveBeenCalledWith(AuthStatusActions.setInitialDataLoaded());
          expect(oauthHasValidAccessToken).toHaveBeenCalled();

          return new Subscription();
        },
      );

      service = TestBed.inject(AuthService);

      expect(oauthServiceEventSubscriberSpy).toHaveBeenCalled();
    });

    it('should load disovery document and try to log and not redirect if the oauth state is falsy', fakeAsync(() => {
      const loadDiscoveryDocumentAndTryLoginSpy = mockOAuthService.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve(true));
      mockOAuthService.state = '';

      service = TestBed.inject(AuthService);

      flushMicrotasks();

      expect(loadDiscoveryDocumentAndTryLoginSpy).toHaveBeenCalled();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    }));

    it('should load disovery document and try to log and redirect if the oauth state is truthy', fakeAsync(() => {
      const loadDiscoveryDocumentAndTryLoginSpy = mockOAuthService.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';

      service = TestBed.inject(AuthService);

      flushMicrotasks();

      expect(loadDiscoveryDocumentAndTryLoginSpy).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('success');
    }));

    it('should attach the authenticated handler properly and react to a truthy isAuthenticated value and empty user info appropriately', fakeAsync(() => {
      mockOAuthService.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = spyOn(store, 'select').and.returnValue(isAuthenticated$.asObservable());
      const oauthLoadUserProfileSpy = mockOAuthService.loadUserProfile.and.resolveTo({info: undefined});
      const storeDispatchSpy = spyOn(store, 'dispatch');

      service = TestBed.inject(AuthService);
      flushMicrotasks();

      isAuthenticated$.next(true);
      flushMicrotasks();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(oauthLoadUserProfileSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: true, userName: undefined}));
    }));

    it('should attach the authenticated handler properly and react to a truthy isAuthenticated value and present user info appropriately', fakeAsync(() => {
      mockOAuthService.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = spyOn(store, 'select').and.returnValue(isAuthenticated$.asObservable());
      const oauthLoadUserProfileSpy = mockOAuthService.loadUserProfile.and.resolveTo({info: {name: 'hello world'}});
      const storeDispatchSpy = spyOn(store, 'dispatch');

      service = TestBed.inject(AuthService);
      flushMicrotasks();

      isAuthenticated$.next(true);
      flushMicrotasks();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(oauthLoadUserProfileSpy).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.setStatus({isAuthenticated: true, userName: 'hello world'}));
    }));

    it('should attach the authenticated handler properly and react to a falsy isAuthenticated value appropriately and attempt a logout if an access token is present', fakeAsync(() => {
      mockOAuthService.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = spyOn(store, 'select').and.returnValue(isAuthenticated$.asObservable());
      const oauthGetAccessTokenSpy = mockOAuthService.getAccessToken.and.returnValue('test-token');

      service = TestBed.inject(AuthService);
      flushMicrotasks();

      isAuthenticated$.next(false);
      flushMicrotasks();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(mockOAuthService.loadUserProfile).not.toHaveBeenCalled();
      expect(oauthGetAccessTokenSpy).toHaveBeenCalled();
      expect(mockOAuthService.logOut).toHaveBeenCalled();
      expect(mockOAuthService.stopAutomaticRefresh).toHaveBeenCalled();
    }));

    it('should attach the authenticated handler properly and react to a falsy isAuthenticated value appropriately and not attempt a logout if no access token is present', fakeAsync(() => {
      mockOAuthService.loadDiscoveryDocumentAndTryLogin.and.returnValue(Promise.resolve(true));
      mockOAuthService.state = 'success';
      const isAuthenticated$ = new Subject<boolean>();
      const storeSelectSpy = spyOn(store, 'select').and.returnValue(isAuthenticated$.asObservable());
      const oauthGetAccessTokenSpy = mockOAuthService.getAccessToken.and.returnValue('');

      service = TestBed.inject(AuthService);
      flushMicrotasks();

      isAuthenticated$.next(false);
      flushMicrotasks();

      expect(storeSelectSpy).toHaveBeenCalledWith(selectIsAuthenticated);
      expect(mockOAuthService.loadUserProfile).not.toHaveBeenCalled();
      expect(oauthGetAccessTokenSpy).toHaveBeenCalled();
      expect(mockOAuthService.logOut).not.toHaveBeenCalled();
      expect(mockOAuthService.stopAutomaticRefresh).toHaveBeenCalled();
    }));
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
      const storeDispatchSpy = spyOn(store, 'dispatch');

      service.logout(true);

      expect(mockAuthNotificationService.showForcedLogoutDialog).toHaveBeenCalled();
      expect(storeDispatchSpy).toHaveBeenCalledOnceWith(AuthStatusActions.setStatus({isAuthenticated: false}));
    });

    it('shows dialog for programmatic logout and sets isAuthenticated', () => {
      const storeDispatchSpy = spyOn(store, 'dispatch');

      service.logout(false);

      expect(mockAuthNotificationService.showProgrammaticLogoutDialog).toHaveBeenCalledTimes(1);
      expect(storeDispatchSpy).toHaveBeenCalledOnceWith(AuthStatusActions.setStatus({isAuthenticated: false}));
    });
  });

  describe('getAccessToken', () => {
    beforeEach(() => {
      service = TestBed.inject(AuthService);
    });

    it('returns the access token from OAuthService', () => {
      const expectedResult = 'test-token';
      mockOAuthService.getAccessToken.and.returnValue(expectedResult);

      const result = service.getAccessToken();

      expect(result).toEqual(expectedResult);
    });
  });
});
