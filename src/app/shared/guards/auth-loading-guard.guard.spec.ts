import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';

import {AuthService} from '../../auth/auth.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {AuthLoadingGuard} from './auth-loading-guard.guard';

describe('authLoadingGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => AuthLoadingGuard(...guardParameters));

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {url: '/'} as RouterStateSnapshot;

  let mockIsDoneLoadingSubject$: BehaviorSubject<boolean>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockIsDoneLoadingSubject$ = new BehaviorSubject<boolean>(false);
    mockAuthService = jasmine.createSpyObj<AuthService>(
      {
        login: void 0,
        logout: void 0,
        getAccessToken: '',
      },
      {
        isDoneLoading$: mockIsDoneLoadingSubject$.asObservable(),
      },
    );

    TestBed.configureTestingModule({
      providers: [{provide: AuthService, useValue: mockAuthService}],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access if `isDoneLoading$` is `true`', (done: DoneFn) => {
    const canActivate = executeGuard(dummyRoute, dummyState);
    expect(canActivate).toBeInstanceOf(Observable<boolean>);
    mockIsDoneLoadingSubject$.next(true);
    (<Observable<boolean>>canActivate).subscribe((value) => {
      expect(value).toBeTrue();
      done();
    });
  });
});
