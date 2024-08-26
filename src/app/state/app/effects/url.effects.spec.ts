import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {routerNavigatedAction} from '@ngrx/router-store';
import {UrlEffects} from './url.effects';
import {UrlActions} from '../actions/url.actions';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRouteSnapshot, NavigationEnd, Params, Router, RouterModule} from '@angular/router';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {selectQueryParams} from '../selectors/router.selector';
import {selectMapConfigParams} from '../../map/selectors/map-config-params.selector';
import {MapConfigActions} from '../../map/actions/map-config.actions';
import {selectMainPage} from '../reducers/url.reducer';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {SearchActions} from '../actions/search.actions';

describe('UrlEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: UrlEffects;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
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
      const mainPage = MainPage.Data;

      const expectedAction = UrlActions.setPage({isSimplifiedPage: false, isHeadlessPage: false, mainPage: MainPage.Data});

      actions$ = of(
        routerNavigatedAction({
          payload: {
            routerState: {url: `/${mainPage}`, root: {} as ActivatedRouteSnapshot},
            event: {} as NavigationEnd,
          },
        }),
      );
      effects.extractMainPageFromUrl$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('setAppParameters$', () => {
    it('dispatches UrlActions.setAppParams() after setting a page', (done: DoneFn) => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', devMode: 'true'};
      store.overrideSelector(selectQueryParams, params);

      const expectedAction = UrlActions.setAppParams({params});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.setAppParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });

  describe('removeTemporaryAppParameters$', () => {
    it('navigates to a new URL where all temporary parameters are set to `null`', (done: DoneFn) => {
      const params = {scale: 789, [RouteParamConstants.GLOBAL_TEMPORARY_URL_PARAMS[0]]: 'temp', basemap: 'Dust II'};
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();

      const expectedParams: Params = {[RouteParamConstants.GLOBAL_TEMPORARY_URL_PARAMS[0]]: null};

      actions$ = of(UrlActions.setAppParams({params}));
      effects.removeTemporaryAppParameters$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledOnceWith(
          [],
          jasmine.objectContaining({
            queryParams: expectedParams,
            queryParamsHandling: 'merge',
          }),
        );
        done();
      });
    });

    it('does not navigate to a new URL if there are no temporary parameters', fakeAsync(() => {
      const params = {scale: 789, basemap: 'Dust II'};
      const router = TestBed.inject(Router);
      const routerSpy = spyOn(router, 'navigate').and.callThrough();

      actions$ = of(UrlActions.setAppParams({params}));
      effects.removeTemporaryAppParameters$.subscribe();
      flush();

      expect(routerSpy).not.toHaveBeenCalled();
    }));
  });

  describe('handleInitialMapPageParameters$', () => {
    it('dispatches UrlActions.setMapPageParams() if current query params are not containing any map config parameters', (done: DoneFn) => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      store.overrideSelector(selectQueryParams, {});
      store.overrideSelector(selectMapConfigParams, params);

      const expectedAction = UrlActions.setMapPageParams({params});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches MapConfigActions.setInitialMapConfig() if current query params are containing any map config parameters', (done: DoneFn) => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').and.returnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapConfigParams, {x: 1, y: 2, scale: 3, basemap: '4'});

      const expectedAction = MapConfigActions.setInitialMapConfig({
        scale: params.scale,
        initialMaps: params.initialMapIds.split(','),
        x: params.x,
        y: params.y,
        basemapId: params.basemap,
      });

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches SearchActions.initializeSearchFromUrlParameters() if current query params contain a searchTerm', (done: DoneFn) => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two', searchTerm: 'search'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').and.returnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapConfigParams, {x: 1, y: 2, scale: 3, basemap: '4'});

      const expectedAction = SearchActions.initializeSearchFromUrlParameters({
        searchTerm: params.searchTerm,
        searchIndex: undefined,
        initialMaps: params.initialMapIds.split(','),
        basemapId: params.basemap,
      });

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });

    it('dispatches SearchActions.initializeSearchFromUrlParameters() if current query params contain a searchIndex', (done: DoneFn) => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two', searchIndex: 'index'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').and.returnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapConfigParams, {x: 1, y: 2, scale: 3, basemap: '4'});

      const expectedAction = SearchActions.initializeSearchFromUrlParameters({
        searchTerm: undefined,
        searchIndex: params.searchIndex,
        initialMaps: params.initialMapIds.split(','),
        basemapId: params.basemap,
      });

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
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
      store.overrideSelector(selectQueryParams, existingParams);

      const expectedParams = params;

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
      const existingParams = {...params, initialMapIds: 'one,two', searchTerm: 'search', searchIndex: 'index'};
      store.overrideSelector(selectQueryParams, existingParams);

      const expectedParams = {...params, initialMapIds: null, searchTerm: null, searchIndex: null};

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
