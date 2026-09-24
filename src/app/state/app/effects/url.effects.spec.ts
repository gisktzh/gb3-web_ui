import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {Observable, of, toArray} from 'rxjs';
import {Action} from '@ngrx/store';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {routerNavigatedAction} from '@ngrx/router-store';
import {UrlEffects} from './url.effects';
import {UrlActions} from '../actions/url.actions';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ActivatedRouteSnapshot, NavigationEnd, Router, RouterModule} from '@angular/router';
import {BasemapConfigService} from '../../../map/services/basemap-config.service';
import {selectQueryParams} from '../selectors/router.selector';
import {selectMapPageParams} from '../../map/selectors/map-config-params.selector';
import {MapConfigActions} from '../../map/actions/map-config.actions';
import {selectKeepTemporaryUrlParams, selectMainPage} from '../reducers/url.reducer';
import {SearchActions} from '../actions/search.actions';
import {InitialMapExtentService} from '../../../map/services/initial-map-extent.service';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {MapUiActions} from '../../map/actions/map-ui.actions';

describe('UrlEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: UrlEffects;
  let initialMapExtentServiceMock: InitialMapExtentService;

  beforeEach(() => {
    actions$ = new Observable<Action>();
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      providers: [UrlEffects, provideMockActions(() => actions$), provideMockStore()],
    });
    effects = TestBed.inject(UrlEffects);
    store = TestBed.inject(MockStore);
    initialMapExtentServiceMock = TestBed.inject(InitialMapExtentService);
    vi.spyOn(initialMapExtentServiceMock, 'calculateInitialExtent').mockImplementation(vi.fn());
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('extractMainPageFromUrl$', () => {
    it('dispatches UrlActions.setPage() if the navigation ended (successfully or not)', () => {
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
      });
    });
  });

  describe('setAppParameters$', () => {
    it('dispatches UrlActions.setAppParams() after setting a page', () => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', devMode: 'true'};
      store.overrideSelector(selectQueryParams, params);

      const expectedAction = UrlActions.setAppParams({params});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.setAppParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('handleInitialMapPageParameters$', () => {
    it('dispatches UrlActions.setMapPageParams() if current query params are not containing any map config parameters', () => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', topics: null};
      store.overrideSelector(selectQueryParams, {});
      store.overrideSelector(selectMapPageParams, params);

      const expectedAction = UrlActions.setMapPageParams({params});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('dispatches LayerCatalogActions.setInitialTopics() and MapConfigActions.setInitialMapConfig() if current query params are containing any map config parameters', () => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      vi.spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').mockReturnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: '4', topics: null});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: params.initialMapIds.split(',')}),
          MapConfigActions.setInitialMapConfig({
            scale: params.scale,
            x: params.x,
            y: params.y,
            basemapId: params.basemap,
          }),
        ]);
      });
    });

    it('dispatches LayerCatalogActions.setInitialTopics() and MapConfigActions.setInitialMapConfig() if current query params contain basemap or initialMapIds', () => {
      const params = {basemap: 'Dust II', initialMapIds: 'one,two'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      vi.spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').mockReturnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: '4', topics: null});
      const extent = vi.spyOn(initialMapExtentServiceMock, 'calculateInitialExtent').mockReturnValue({x: 11, y: 22, scale: 33})();

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: params.initialMapIds.split(',')}),
          MapConfigActions.setInitialMapConfig({
            ...extent,
            basemapId: params.basemap,
          }),
        ]);
      });
    });

    it('merges normalized topics with legacy initialMapIds instead of dropping them', () => {
      const params = {topics: ' topic-a,topic-b,topic-a ', initialMapIds: 'legacy-topic'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      vi.spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').mockReturnValue('base');
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: 'base', topics: null});
      vi.spyOn(initialMapExtentServiceMock, 'calculateInitialExtent').mockReturnValue({x: 11, y: 22, scale: 33});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: ['topic-a', 'topic-b', 'legacy-topic']}),
          MapConfigActions.setInitialMapConfig({
            x: 11,
            y: 22,
            scale: 33,
            basemapId: 'base',
          }),
        ]);
      });
    });

    it('merges an explicitly empty topics parameter with legacy initialMapIds instead of treating it as authoritative', () => {
      store.overrideSelector(selectQueryParams, {topics: '', initialMapIds: 'legacy-topic'});
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: 'base', topics: null});
      vi.spyOn(initialMapExtentServiceMock, 'calculateInitialExtent').mockReturnValue({x: 11, y: 22, scale: 33});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: ['legacy-topic']}),
          MapConfigActions.setInitialMapConfig({
            x: 11,
            y: 22,
            scale: 33,
            basemapId: expect.any(String),
          }),
        ]);
      });
    });

    it('initializes topics independently from URL search parameters', () => {
      store.overrideSelector(selectQueryParams, {topics: 'topic-a,topic-b', searchTerm: 'search'});
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: 'base', topics: null});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: ['topic-a', 'topic-b']}),
          SearchActions.initializeSearchFromUrlParameters({
            searchTerm: 'search',
            searchIndex: undefined,
            basemapId: expect.any(String),
          }),
        ]);
      });
    });

    it('dispatches LayerCatalogActions.setInitialTopics() and SearchActions.initializeSearchFromUrlParameters() if current query params contain a searchTerm', () => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two', searchTerm: 'search'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      vi.spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').mockReturnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: '4', topics: null});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: params.initialMapIds.split(',')}),
          SearchActions.initializeSearchFromUrlParameters({
            searchTerm: params.searchTerm,
            searchIndex: undefined,
            basemapId: params.basemap,
          }),
        ]);
      });
    });

    it('dispatches LayerCatalogActions.setInitialTopics() and SearchActions.initializeSearchFromUrlParameters() if current query params contain a searchIndex', () => {
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II', initialMapIds: 'one,two', searchIndex: 'index'};
      const basemapConfigService = TestBed.inject(BasemapConfigService);
      vi.spyOn(basemapConfigService, 'checkBasemapIdOrGetDefault').mockReturnValue(params.basemap);
      store.overrideSelector(selectQueryParams, params);
      store.overrideSelector(selectMapPageParams, {x: 1, y: 2, scale: 3, basemap: '4', topics: null});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleInitialMapPageParameters$.pipe(toArray()).subscribe((actions) => {
        expect(actions).toEqual([
          LayerCatalogActions.setInitialTopics({topicIds: params.initialMapIds.split(',')}),
          SearchActions.initializeSearchFromUrlParameters({
            searchTerm: undefined,
            searchIndex: params.searchIndex,
            basemapId: params.basemap,
          }),
        ]);
      });
    });
  });

  describe('handleCollapsedUrlParameter$', () => {
    it('dispatches MapUiActions.changeUiElementsVisibility() if collapsed query param is true', () => {
      const params = {collapsed: 'true'};
      store.overrideSelector(selectQueryParams, params);

      const expectedAction = MapUiActions.changeUiElementsVisibility({hideAllUiElements: true, hideUiToggleButton: false});

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleCollapsedUrlParameter$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });

    it('does not dispatch any action if collapsed query param is not true', () => {
      const params = {collapsed: 'false'};
      store.overrideSelector(selectQueryParams, params);
      let wasCalled = false;

      actions$ = of(UrlActions.setPage({mainPage: MainPage.Maps, isHeadlessPage: false, isSimplifiedPage: false}));
      effects.handleCollapsedUrlParameter$.subscribe(() => {
        wasCalled = true;
      });

      expect(wasCalled).toBe(false);
    });
  });

  describe('setMapPageParameters$', () => {
    it('navigates to the adjusted params if they are different to the current ones, no further action dispatch', () => {
      const router = TestBed.inject(Router);
      const routerSpy = vi.spyOn(router, 'navigate');
      store.overrideSelector(selectMainPage, MainPage.Maps);
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II'};
      const existingParams = {x: 1, y: 2, scale: 3, basemap: '4'};
      store.overrideSelector(selectQueryParams, existingParams);
      store.overrideSelector(selectKeepTemporaryUrlParams, false);

      const expectedParams = params;

      actions$ = of(UrlActions.setMapPageParams({params}));
      effects.setMapPageParameters$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledTimes(1);
        expect(routerSpy).toHaveBeenCalledWith([], expect.objectContaining({queryParams: expectedParams}));
      });
    });

    it('removes all temporary parameters even if all other params are identical, no further action dispatch', () => {
      const router = TestBed.inject(Router);
      const routerSpy = vi.spyOn(router, 'navigate');
      store.overrideSelector(selectMainPage, MainPage.Maps);
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II'};
      const existingParams = {...params, initialMapIds: 'one,two', searchTerm: 'search', searchIndex: 'index', collapsed: 'true'};
      store.overrideSelector(selectQueryParams, existingParams);
      store.overrideSelector(selectKeepTemporaryUrlParams, false);

      const expectedParams = {...params, initialMapIds: null, searchTerm: null, searchIndex: null, collapsed: null};

      actions$ = of(UrlActions.setMapPageParams({params}));
      effects.setMapPageParameters$.subscribe(() => {
        expect(routerSpy).toHaveBeenCalledTimes(1);
        expect(routerSpy).toHaveBeenCalledWith([], expect.objectContaining({queryParams: expectedParams}));
      });
    });

    it('does not navigate to the new params if they are not different to the current ones, no further action dispatch', async () => {
      vi.useFakeTimers();

      const router = TestBed.inject(Router);
      const routerSpy = vi.spyOn(router, 'navigate');
      store.overrideSelector(selectMainPage, MainPage.Maps);
      const params = {x: 123, y: 456, scale: 789, basemap: 'Dust II'};
      const existingParams = params;
      store.overrideSelector(selectQueryParams, existingParams);
      store.overrideSelector(selectKeepTemporaryUrlParams, false);

      actions$ = of(UrlActions.setMapPageParams({params}));
      effects.setMapPageParameters$.subscribe();
      await vi.runAllTimersAsync();

      expect(routerSpy).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('does not navigate when the current page is not the maps page', async () => {
      vi.useFakeTimers();
      const router = TestBed.inject(Router);
      const routerSpy = vi.spyOn(router, 'navigate');
      store.overrideSelector(selectMainPage, MainPage.Data);
      store.overrideSelector(selectQueryParams, {});
      store.overrideSelector(selectKeepTemporaryUrlParams, false);

      actions$ = of(UrlActions.setMapPageParams({params: {topics: 'one'}}));
      effects.setMapPageParameters$.subscribe();
      await vi.runAllTimersAsync();

      expect(routerSpy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('keepTemporaryUrlParameters$', () => {
    const actions = [
      {name: 'SearchActions.setSearchApiError', action: SearchActions.setSearchApiError},
      {name: 'SearchActions.handleEmptyResultsFromUrlSearch', action: SearchActions.handleEmptyResultsFromUrlSearch},
      {name: 'SearchActions.handleInvalidParameters', action: SearchActions.handleInvalidParameters},
    ];
    actions.forEach(({name, action}) => {
      it(`dispatches UrlActions.keepTemporaryUrlParameters when ${name} is triggered`, () => {
        const expectedAction = UrlActions.keepTemporaryUrlParameters();

        actions$ = of(action);
        effects.keepTemporaryUrlParameters$.subscribe((result) => {
          expect(result).toEqual(expectedAction);
        });
      });
    });
  });
});
