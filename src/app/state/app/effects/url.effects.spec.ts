import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {routerNavigatedAction} from '@ngrx/router-store';
import {UrlEffects} from './url.effects';
import {UrlActions} from '../actions/url.actions';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRouteSnapshot, NavigationEnd, Router} from '@angular/router';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {selectQueryParams} from '../selectors/router.selector';
import {selectMapConfigParams} from '../../map/selectors/map-config-params.selector';
import {MapConfigActions} from '../../map/actions/map-config.actions';
import {selectMainPage} from '../reducers/url.reducer';

describe('UrlEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: UrlEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [UrlEffects, provideMockActions(() => actions$), provideMockStore()],
    });
    effects = TestBed.inject(UrlEffects);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('extractMainPageFromUrl$', () => {
    it('dispatches UrlActions.setPage() if the navigation ended (successfully or not)', (done: DoneFn) => {
      const expectedMainPage = MainPage.Data;
      actions$ = of(
        routerNavigatedAction({
          payload: {
            routerState: {url: `/${expectedMainPage}`, root: {} as ActivatedRouteSnapshot},
            event: {} as NavigationEnd,
          },
        }),
      );
      effects.extractMainPageFromUrl$.subscribe((action) => {
        expect(action).toEqual(UrlActions.setPage({isSimplifiedPage: false, isHeadlessPage: false, mainPage: MainPage.Data}));
        done();
      });
    });
  });

  describe('handleInitialMapPageParameters$', () => {
    it('dispatches UrlActions.setMapPageParams() if current query params are not containing any map config parameters', (done: DoneFn) => {
      const expectedParams = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      store.overrideSelector(selectQueryParams, {});
      store.overrideSelector(selectMapConfigParams, expectedParams);

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(UrlActions.setMapPageParams({params: expectedParams}));
        done();
      });
    });

    it('dispatches MapConfigActions.setInitialMapConfig() if current query params are containing any map config parameters', (done: DoneFn) => {
      const expectedParams = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').and.returnValue(expectedParams.basemap);
      store.overrideSelector(selectQueryParams, expectedParams);
      store.overrideSelector(selectMapConfigParams, {x: 1, y: 2, scale: 3, basemap: '4'});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(
          MapConfigActions.setInitialMapConfig({
            scale: expectedParams.scale,
            initialMaps: expectedParams.initialMapIds.split(','),
            x: expectedParams.x,
            y: expectedParams.y,
            basemapId: expectedParams.basemap,
          }),
        );
        done();
      });
    });
  });

  describe('setMapPageParameters$', () => {
    it('navigates to the adjusted params if they are different to the current ones, no further action dispatch', (done: DoneFn) => {
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();
      store.overrideSelector(selectMainPage, MainPage.Maps);
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II'};
      const existingParams = {x: 1, y: 2, scale: 3, basemap: '4'};
      const expectedParams = params;
      store.overrideSelector(selectQueryParams, existingParams);

      actions$ = of(UrlActions.setMapPageParams({params}));
      effects.setMapPageParameters$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledOnceWith([], jasmine.objectContaining({queryParams: expectedParams}));
        done();
      });
    });

    it('removes all temporary parameters even if all other params are identical, no further action dispatch', (done: DoneFn) => {
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();
      store.overrideSelector(selectMainPage, MainPage.Maps);
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II'};
      const existingParams = {...params, initialMapIds: 'one,two'};
      const expectedParams = {...params, initialMapIds: null};
      store.overrideSelector(selectQueryParams, existingParams);

      actions$ = of(UrlActions.setMapPageParams({params}));
      effects.setMapPageParameters$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledOnceWith([], jasmine.objectContaining({queryParams: expectedParams}));
        done();
      });
    });

    it('does not navigate to the new params if they are not different to the current ones, no further action dispatch', fakeAsync(() => {
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();
      store.overrideSelector(selectMainPage, MainPage.Maps);
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II'};
      const existingParams = params;
      store.overrideSelector(selectQueryParams, existingParams);

      actions$ = of(UrlActions.setMapPageParams({params}));
      effects.setMapPageParameters$.subscribe();
      flush();

      expect(routerSpy).not.toHaveBeenCalled();
    }));
  });
});
