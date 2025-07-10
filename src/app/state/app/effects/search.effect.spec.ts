import {provideMockActions} from '@ngrx/effects/testing';
import {fakeAsync, flush, TestBed} from '@angular/core/testing';
import {EMPTY, Observable, of, throwError} from 'rxjs';
import {Action} from '@ngrx/store';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../../testing/map-testing/map.service.stub';
import {SearchEffects} from './search.effects';
import {SearchActions} from '../actions/search.actions';
import {GeometrySearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
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
    it('throws a SearchResultsCouldNotBeLoaded error', (done: DoneFn) => {
      store.overrideSelector(selectIsAuthenticated, true);
      const originalError = new Error('error');
      actions$ = of(SearchActions.setSearchApiError({error: originalError}));
      effects.throwSearchApiError$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new SearchResultsCouldNotBeLoaded(true, originalError);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });

  describe('zoomToAndHighlightSelectedSearchResult$', () => {
    it('calls mapService.zoomToExtent and MapDrawingSerivce.drawSearchResultHighlight', (done: DoneFn) => {
      const mapService = TestBed.inject(MAP_SERVICE);
      const mapServiceSpy = spyOn(mapService, 'zoomToExtent').and.callThrough();
      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'drawSearchResultHighlight').and.callThrough();
      store.overrideSelector(selectReady, true);

      const searchResultsMock: GeometrySearchApiResultMatch = {
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
        done();
      });
    });
  });

  describe('clearSearchTermAfterFeatureInfoOpened$', () => {
    it('dispatches SearchActions.clearSearchTerm() if FeatureInfo is opened', (done: DoneFn) => {
      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: true}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => {
        expect(action).toEqual(SearchActions.clearSearchTerm());
        done();
      });
    });

    it('dispatches nothing when FeatureINfo is closed', fakeAsync(async () => {
      let newAction;

      actions$ = of(MapUiActions.setFeatureInfoVisibility({isVisible: false}));
      effects.clearSearchTermAfterFeatureInfoOpened$.subscribe((action) => (newAction = action));
      flush();

      expect(newAction).toBeUndefined();
    }));
  });

  describe('removeHighlightAfterChangingSearchTermOrClearingSearchResult$', () => {
    it('calls mapDrawingService.clearSearchResultHighlight() if on map-page', (done: DoneFn) => {
      store.overrideSelector(selectUrlState, {
        mainPage: MainPage.Maps,
        isHeadlessPage: false,
        isSimplifiedPage: false,
        previousPage: MainPage.Data,
        keepTemporaryUrlParams: false,
      });

      const mapDrawingService = TestBed.inject(MapDrawingService);
      const mapDrawingServiceSpy = spyOn(mapDrawingService, 'clearSearchResultHighlight').and.callThrough();

      actions$ = of(SearchActions.clearSearchTerm());
      effects.removeHighlightAfterChangingSearchTermOrClearingSearchResult$.subscribe(() => {
        expect(mapDrawingServiceSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('dispatches nothing when on any other page than map-page', fakeAsync(async () => {
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
      flush();

      expect(newAction).toBeUndefined();
    }));
  });

  describe('validateSearchUrlParameters$', () => {
    it('dispatches SearchActions.handleInvalidParameters() if search term is undefined', (done: DoneFn) => {
      const searchIndexString = 'index';
      const searchTerm = undefined;
      const basemapId = 'base';
      const initialMaps = ['one', 'two'];

      const expectedAction = SearchActions.handleInvalidParameters();
      actions$ = of(SearchActions.initializeSearchFromUrlParameters({searchTerm, searchIndex: searchIndexString, initialMaps, basemapId}));
      effects.validateSearchUrlParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
    it('dispatches SearchActions.handleInvalidParameters() if search index is undefined', (done: DoneFn) => {
      const searchIndexString = undefined;
      const searchTerm = 'term';
      const basemapId = 'base';
      const initialMaps = ['one', 'two'];

      const expectedAction = SearchActions.handleInvalidParameters();
      actions$ = of(SearchActions.initializeSearchFromUrlParameters({searchTerm, searchIndex: searchIndexString, initialMaps, basemapId}));
      effects.validateSearchUrlParameters$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
    it('dispatches SearchActions.searchForTermFromUrlParams() if search index and search term are defined', (done: DoneFn) => {
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
        done();
      });
    });
  });
  describe('handleSearchUrlParameter$', () => {
    it('dispatches SeacrchActions.handleEmptyResultsFromUrlSearch if no results are found', (done: DoneFn) => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const searchServiceSpy = spyOn(searchService, 'searchIndexes').and.returnValue(of([]));
      const expectedAction = SearchActions.handleEmptyResultsFromUrlSearch({searchTerm});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledOnceWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
    it('dispatches SeacrchActions.handleEmptyResultsFromUrlSearch if no geometry exist on the best results', (done: DoneFn) => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const searchServiceSpy = spyOn(searchService, 'searchIndexes').and.returnValue(
        of([{indexType: 'index'} as unknown as GeometrySearchApiResultMatch]),
      );
      const expectedAction = SearchActions.handleEmptyResultsFromUrlSearch({searchTerm});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledOnceWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
    it('dispatches SearchActions.selectMapSearchResult if a GeometrySearchApiResultMatch is found', (done: DoneFn) => {
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
      } as GeometrySearchApiResultMatch;
      const searchServiceSpy = spyOn(searchService, 'searchIndexes').and.returnValue(of([expectedResult]));
      const expectedAction = SearchActions.selectMapSearchResult({searchResult: expectedResult});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledOnceWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
    it('dispatches SearchActions.setSearchApiError if an error occurs', (done: DoneFn) => {
      const searchIndexString = 'index';
      const searchTerm = 'term';
      const searchIndex: SearchIndex = {
        indexName: searchIndexString,
        label: searchIndexString,
        active: true,
        indexType: 'activeMapItems',
      };
      const expectedError = new Error('error');
      const searchServiceSpy = spyOn(searchService, 'searchIndexes').and.returnValue(throwError(() => expectedError));
      const expectedAction = SearchActions.setSearchApiError({error: expectedError});
      actions$ = of(SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex}));
      effects.handleSearchUrlParameter$.subscribe((action) => {
        expect(searchServiceSpy).toHaveBeenCalledOnceWith(searchTerm, [searchIndex]);
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
  describe('throwErrorForInvalidSearchParameters$', () => {
    it('throws an InvalidSearchParameters error', (done: DoneFn) => {
      actions$ = of(SearchActions.handleInvalidParameters());
      effects.throwErrorForInvalidSearchParameters$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new InvalidSearchParameters();
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
  describe('throwErrorForEmptySearchResults$', () => {
    it('throws an NoSearchResultsFoundForParameters error', (done: DoneFn) => {
      const searchTerm = 'Empty Results';
      actions$ = of(SearchActions.handleEmptyResultsFromUrlSearch({searchTerm}));
      effects.throwErrorForEmptySearchResults$
        .pipe(
          catchError((error: unknown) => {
            const expectedError = new NoSearchResultsFoundForParameters(searchTerm);
            expect(error).toEqual(expectedError);
            done();
            return EMPTY;
          }),
        )
        .subscribe();
    });
  });
  describe('resetSearchLoadingState$', () => {
    it('dispatches SeacrchActions.resetLoadingState on SearchActions.handleEmptyResultsFromUrlSearch', (done: DoneFn) => {
      const expectedAction = SearchActions.resetLoadingState();
      const searchTerm = 'Empty Results';
      actions$ = of(SearchActions.handleEmptyResultsFromUrlSearch({searchTerm}));
      effects.resetSearchLoadingState$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
    it('dispatches SeacrchActions.resetLoadingState on SearchActions.handleInvalidParameters', (done: DoneFn) => {
      const expectedAction = SearchActions.resetLoadingState();
      actions$ = of(SearchActions.handleInvalidParameters());
      effects.resetSearchLoadingState$.subscribe((action) => {
        expect(action).toEqual(expectedAction);
        done();
      });
    });
  });
});
