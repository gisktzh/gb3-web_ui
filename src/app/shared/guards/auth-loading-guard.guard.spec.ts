import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {authLoadingGuard} from './auth-loading-guard.guard';
import {selectIsInitialDataLoaded} from '../../state/auth/reducers/auth-status.reducer';
import {MockStore, provideMockStore} from '@ngrx/store/testing';

describe('authLoadingGuardGuard', () => {
  let store: MockStore;
  const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => authLoadingGuard(...guardParameters));

  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {url: '/'} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})],
    });

    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('blocks access if `selectIsInitialDataLoaded` is `false`', (done: DoneFn) => {
    store.overrideSelector(selectIsInitialDataLoaded, false);

    const expected = false;

    const canActivate = executeGuard(dummyRoute, dummyState);
    expect(canActivate).toBeInstanceOf(Observable<boolean>);
    (<Observable<boolean>>canActivate).subscribe((value) => {
      expect(value).toBe(expected);
      done();
    });
  });

  it('allows access if `selectIsInitialDataLoaded` is `true`', (done: DoneFn) => {
    store.overrideSelector(selectIsInitialDataLoaded, true);

    const expected = true;

    const canActivate = executeGuard(dummyRoute, dummyState);
    expect(canActivate).toBeInstanceOf(Observable<boolean>);
    (<Observable<boolean>>canActivate).subscribe((value) => {
      expect(value).toBe(expected);
      done();
    });
  });
});
