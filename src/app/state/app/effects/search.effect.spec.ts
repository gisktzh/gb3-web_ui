import {provideMockActions} from '@ngrx/effects/testing';
import {TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {SearchEffects} from './search.effects';
import {SearchActions} from '../actions/search.actions';
import {GeometryWithSrsSearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {selectUrlState} from '../reducers/url.reducer';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {selectReady} from '../../map/reducers/map-config.reducer';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {SearchService} from '../../../shared/services/apis/search/services/search.service';
import {GeometryWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {
  InvalidSearchParameters,
  NoSearchResultsFoundForParameters,
  SearchResultsCouldNotBeLoaded,
} from '../../../shared/errors/search.errors';
import {catchError} from 'rxjs';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';
import {MAP_SERVICE} from '../../../app.tokens';

describe('SearchEffects', () => {
  let actions$: Observable<Action>;
  let store: MockStore;
  let effects: SearchEffects;
  let searchService: SearchService;

  beforeEach(() => {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        SearchEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {provide: MAP_SERVICE, useClass: MapServiceStub},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    effects = TestBed.inject(SearchEffects);
    store = TestBed.inject(MockStore);
    searchService = TestBed.inject(SearchService);
  });

  afterEach(() => {
    store.resetSelectors();
  });

  describe('throwSearchApiError$', () => {
    it('throws a SearchResultsCouldNotBeLoaded error', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      const originalError = new Error('error');
      actions$ = of(SearchActions.setSearchApiError({error: originalError}));
      effects.throwSearchApiError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new SearchResultsCouldNotBeLoaded(true, originalError);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('zoomToAndHighlightSelectedSearchResult$', () => {
    it('calls mapService.zoomToExtent and MapDrawingSerivce.drawSearchResultHighlight', () => {
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = vi.spyOn(mapService, 'zoomToExtent');
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = vi.spyOn(mapDrawingService, 'drawSearchResultHighlight');
      store.overrideSelector(selectReady, true);

      const searchResultsMock: GeometryWithSrsSearchApiResultMatch = {
        indexType: 'places',
        displayString: 'Some Place',
        score: 1,
        geometry: {type: 'Point', srs: 2056, coordinates: [1, 2]},
      };

      const expectedAction = SearchActions.selectMapSearchResult({
        searchResult: searchResultsMock,
      });
      actions$ = of(expectedAction);
      effects.zoomToAndHighlightSelectedSearchResult$.subscribe(([action]) => {
        expect(mapServiceSpy).toHaveBeenCalledTimes(1);
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        expect(action).toEqual(expectedAction);
      });
    });
  });

  describe('clearSearchTermAfterFeatureInfoOpened$', () => {
    it('dispatches SearchActions.clearSearchTerm() if FeatureInfo is opened', () => {
      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: true}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => {
        expect(action).toEqual(SearchActions.clearSearchTerm());
      });
    });

    it('dispatches nothing when FeatureINfo is closed', async () => {
      vi.useFakeTimers();

      let newAction;

      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('removeHighlightAfterChangingSearchTermOrClearingSearchResult$', () => {
    it('calls mapDrawingService.clearSearchResultHighlight() if on map-page', () => {
      store.overrideSelector(selectUrlState, {
        mainPage: MainPage.Maps,
        isHeadlessPage: false,
        isSimplifiedPage: false,
        previousPage: MainPage.Data,
        keepTemporaryUrlParams: false,
      });

      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = vi.spyOn(mapDrawingService, 'clearSearchResultHighlight');

      actions$ = of(SearchActions.clearSearchTerm());
      effects.removeHighlightAfterChangingSearchTermOrClearingSearchResult$.subscribe(() => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('dispatches nothing when on any other page than map-page', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectUrlState, {
        mainPage: MainPage.Start,
        isHeadlessPage: false,
        isSimplifiedPage: false,
        previousPage: MainPage.Data,
        keepTemporaryUrlParams: false,
      });

      let newAction;
      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => (newAction = action));
      await vi.runAllTimersAsync();

      expect(newAction).toBeUndefined();

      vi.useRealTimers();
    });
  });

  describe('validateSearchUrlParameters$', () => {
    it('dispatches SearchActions.handleInvalidParameters() if search term is undefined', () => {
      const searchIndexString = 'index';
      const searchTerm = undefined;
      const basemapId = 'base';
      const initialMaps = ['one', 'two'];

      const expectedAction = SearchActions.handleInvalidParameters();
      actions$ = of(SearchActions.initializeSearchFromUrlParameters({searchTerm, searchIndex: searchIndexString, initialMaps, basemapId}));
      effects.validateSearchUrlParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
    it('dispatches SearchActions.handleInvalidParameters() if search index is undefined', () => {
      const searchIndexString = undefined;
      const searchTerm = 'term';
      const basemapId = 'base';
      const initialMaps = ['one', 'two'];

      const expectedAction = SearchActions.handleInvalidParameters();
      actions$ = of(SearchActions.initializeSearchFromUrlParameters({searchTerm, searchIndex: searchIndexString, initialMaps, basemapId}));
      effects.validateSearchUrlParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
    it('dispatches SearchActions.searchForTermFromUrlParams() if search index and search term are defined', () => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const basemapId = 'base';
      const initialMaps = ['one', 'two'];
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };

      const expectedAction = SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex});
      actions$ = of(SearchActions.initializeSearchFromUrlParameters({searchTerm, searchIndex: searchIndexString, initialMaps, basemapId}));
      effects.validateSearchUrlParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });
  describe('handleSearchUrlParameter$', () => {
    it('dispatches SeacrchActions.handleEmptyResultsFromUrlSearch if no results are found', () => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const searchServiceSpy = vi.spyOn(searchService, 'searchIndexes').mockReturnValue(of([]));
      const expectedAction = SearchActions.handleEmptyResultsFromUrlSearch({searchTerm});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledTimes(1);
        expect(searchServiceSpy).toHaveBeenCalledWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
      });
    });
    it('dispatches SeacrchActions.handleEmptyResultsFromUrlSearch if no geometry exist on the best results', () => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const searchServiceSpy = vi
        .spyOn(searchService, 'searchIndexes')
        .mockReturnValue(of([{indexType: 'index'} as unknown as GeometryWithSrsSearchApiResultMatch]));
      const expectedAction = SearchActions.handleEmptyResultsFromUrlSearch({searchTerm});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledTimes(1);
        expect(searchServiceSpy).toHaveBeenCalledWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
      });
    });
    it('dispatches SearchActions.selectMapSearchResult if a GeometrySearchApiResultMatch is found', () => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const expectedResult = {
        indexType: 'places',
        displayString: 'result',
        geometry: {} as GeometryWithSrs,
        score: 100,
      } as GeometryWithSrsSearchApiResultMatch;
      const searchServiceSpy = vi.spyOn(searchService, 'searchIndexes').mockReturnValue(of([expectedResult]));
      const expectedAction = SearchActions.selectMapSearchResult({searchResult: expectedResult});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledTimes(1);
        expect(searchServiceSpy).toHaveBeenCalledWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
      });
    });
    it('dispatches SearchActions.setSearchApiError if an error occurs', () => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const expectedError = new Error('error');
      const searchServiceSpy = vi.spyOn(searchService, 'searchIndexes').mockReturnValue(throwError(() => expectedError));
      const expectedAction = SearchActions.setSearchApiError({error: expectedError});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledTimes(1);
        expect(searchServiceSpy).toHaveBeenCalledWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
      });
    });
  });
  describe('throwErrorForInvalidSearchParameters$', () => {
    it('throws an InvalidSearchParameters error', () => {
      actions$ = of(SearchActions.handleInvalidParameters());
      effects.throwErrorForInvalidSearchParameters$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new InvalidSearchParameters();
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
  describe('throwErrorForEmptySearchResults$', () => {
    it('throws an NoSearchResultsFoundForParameters error', () => {
      const searchTerm = 'Empty Results';
      actions$ = of(SearchActions.handleEmptyResultsFromUrlSearch({searchTerm}));
      effects.throwErrorForEmptySearchResults$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new NoSearchResultsFoundForParameters(searchTerm);
            expect(error).toEqual(expectedError);
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
  describe('resetSearchLoadingState$', () => {
    it('dispatches SeacrchActions.resetLoadingState on SearchActions.handleEmptyResultsFromUrlSearch', () => {
      const expectedAction = SearchActions.resetLoadingState();
      const searchTerm = 'Empty Results';
      actions$ = of(SearchActions.handleEmptyResultsFromUrlSearch({searchTerm}));
      effects.resetSearchLoadingState$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
    it('dispatches SeacrchActions.resetLoadingState on SearchActions.handleInvalidParameters', () => {
      const expectedAction = SearchActions.resetLoadingState();
      actions$ = of(SearchActions.handleInvalidParameters());
      effects.resetSearchLoadingState$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
      });
    });
  });
});
