import {Observable, of} from 'rxjs';
import {UrlActions} from '../actions/url.actions';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {AppActions} from '../actions/app.actions';
import {Action} from '@ngrx/store';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {AppEffects} from './app.effects';

describe('AppEffects', () => {
  let actions$: Observable<Action>;
  let effects: AppEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      providers: [AppEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(AppEffects);
  });

  describe('handleDevModeParameter$', () => {
    it('dispatches AppActions.activateDevMode() after the app parameters were set containing the dev mode parameter', (done: DoneFn) => {
      const expectedAction = AppActions.activateDevMode();

      actions$ = of(UrlActions.setAppParams({params: {[RouteParamConstants.DEV_MODE_PARAMETER]: 'true', ['han']: 'solo'}}));
      effects.handleDevModeParameter$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches nothing if the value for dev mode is not true', fakeAsync(async () => {
      let newAction;
      actions$ = of(UrlActions.setAppParams({params: {[RouteParamConstants.DEV_MODE_PARAMETER]: 'false', ['bat']: 'man'}}));
      effects.handleDevModeParameter$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));

    it('dispatches nothing if dev mode is not within the app parameters', fakeAsync(async () => {
      let newAction;
      actions$ = of(UrlActions.setAppParams({params: {['c']: '3po', ['r2']: 'd2'}}));
      effects.handleDevModeParameter$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));
  });
});
