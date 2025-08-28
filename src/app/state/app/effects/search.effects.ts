import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {combineLatestWith, distinctUntilChanged, filter, of, switchMap, takeWhile, tap} from 'rxjs';
import {SearchActions} from '../actions/search.actions';
import {SearchService} from '../../../shared/services/apis/search/services/search.service';
import {Store} from '@ngrx/store';
import {catchError, map} from 'rxjs';
import {
  InvalidSearchParameters,
  NoSearchResultsFoundForParameters,
  SearchResultsCouldNotBeLoaded,
} from '../../../shared/errors/search.errors';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {selectAvailableSpecialSearchIndexes} from '../../map/selectors/available-search-index.selector';
import {ConfigService} from '../../../shared/services/config.service';
import {selectLoadingState as selectDataCatalogueLoadingState} from '../../data-catalogue/reducers/data-catalogue.reducer';
import {DataCatalogueActions} from '../../data-catalogue/actions/data-catalogue.actions';
import {SearchIndexType} from '../../../shared/configs/search-index.config';
import {MapService} from '../../../map/interfaces/map.service';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {selectUrlState} from '../reducers/url.reducer';
import {selectTerm} from '../reducers/search.reducer';
import {selectReady} from '../../map/reducers/map-config.reducer';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {isGeometrySearchApiResultMatch} from '../../../shared/type-guards/search-api-result-match.type-guard';
import {selectIsAuthenticated} from '../../auth/reducers/auth-status.reducer';
import {MAP_SERVICE} from '../../../app.tokens';

@Injectable()
export class SearchEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly searchService = inject(SearchService);
  private readonly configService = inject(ConfigService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly mapDrawingService = inject(MapDrawingService);

  public searchResultsFromSearchApi$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      distinctUntilChanged((prev, curr) => prev.term.trim() === curr.term.trim()),
      filter((termAndOptions) => termAndOptions.options.searchIndexTypes.length > 0),
      combineLatestWith(
        this.store
          .select(selectAvailableSpecialSearchIndexes)
          // simplified 'distinctUntilChanged' due to the fact that it is not possible to add and remove active map items with new search indexes at the same time;
          // therefore, comparing the amount of previous and current search indexes suffices to distinct between new indexes
          .pipe(distinctUntilChanged((previous, current) => previous.length === current.length)),
        this.store.select(selectTerm),
      ),
      takeWhile(([termAndOptions]) => termAndOptions.options.searchIndexTypes.length > 0),
      switchMap(([termAndOptions, activeMapIndexes, term]) => {
        const searchIndexes = this.configService.filterSearchIndexes(termAndOptions.options.searchIndexTypes);
        if (termAndOptions.options.searchIndexTypes.includes('activeMapItems')) {
          searchIndexes.push(...activeMapIndexes);
        }
        return this.searchService.searchIndexes(term, searchIndexes).pipe(
          map((results) => SearchActions.setSearchApiResults({results})),
          catchError((error: unknown) => of(SearchActions.setSearchApiError({error}))),
        );
      }),
    );
  });

  public throwSearchApiError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.setSearchApiError),
        concatLatestFrom(() => this.store.select(selectIsAuthenticated)),
        tap(([{error}, isAuthenticated]) => {
          throw new SearchResultsCouldNotBeLoaded(isAuthenticated, error);
        }),
      );
    },
    {dispatch: false},
  );

  public loadLayerCatalogueForSearch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((value) => value.options.maps),
      concatLatestFrom(() => this.store.select(selectLayerCatalogLoadingState)),
      filter(([_, layerCatalogLoadingState]) => layerCatalogLoadingState === undefined),
      map(() => LayerCatalogActions.loadLayerCatalog()),
    );
  });

  public setActiveMapItemsFilters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.setFilterGroups),
      filter(({filterGroups}) => filterGroups.some((filterGroup) => filterGroup.useDynamicActiveMapItemsFilter)),
      combineLatestWith(this.store.select(selectAvailableSpecialSearchIndexes)),
      takeWhile(([{filterGroups}, _]) => filterGroups.some((filterGroup) => filterGroup.useDynamicActiveMapItemsFilter)),
      distinctUntilChanged(),
      map(([_, availableSpecialSearchIndexes]) =>
        SearchActions.setActiveMapItemsFilterGroup({searchIndexes: availableSpecialSearchIndexes}),
      ),
    );
  });

  public loadMetadataProductsForSearch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((value) =>
        value.options.searchIndexTypes.some((indexType) =>
          (['metadata-products', 'metadata-datasets', 'metadata-services', 'metadata-maps'] as SearchIndexType[]).includes(indexType),
        ),
      ),
      concatLatestFrom(() => this.store.select(selectDataCatalogueLoadingState)),
      filter(([_, dataCatalogueLoadingState]) => dataCatalogueLoadingState === undefined),
      map(() => DataCatalogueActions.loadCatalogue()),
    );
  });

  public zoomToAndHighlightSelectedSearchResult$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.selectMapSearchResult),
        combineLatestWith(this.store.select(selectReady)),
        filter(([, isMapViewReady]) => isMapViewReady),
        tap(([{searchResult}]) => {
          // only zoom to result if the geometry is available in the index
          if (searchResult.geometry) {
            this.mapService.zoomToExtent(searchResult.geometry);
            this.mapDrawingService.drawSearchResultHighlight(searchResult.geometry);
          }
        }),
      );
    },
    {dispatch: false},
  );

  public clearSearchTermAfterFeatureInfoOpened$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setFeatureInfoVisibility),
      filter(({isVisible}) => isVisible),
      map(() => SearchActions.clearSearchTerm()),
    );
  });

  public removeHighlightAfterChangingSearchTermOrClearingSearchResult$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.searchForTerm, SearchActions.clearSearchTerm),
        concatLatestFrom(() => this.store.select(selectUrlState)),
        filter(([_, urlState]) => urlState.mainPage === 'maps'),
        tap(() => {
          this.mapDrawingService.clearSearchResultHighlight();
        }),
      );
    },
    {dispatch: false},
  );

  public validateSearchUrlParameters$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.initializeSearchFromUrlParameters),
      map(({searchTerm, searchIndex: searchIndexString}) => {
        if (!searchTerm || !searchIndexString) {
          return SearchActions.handleInvalidParameters();
        }
        const searchIndex: SearchIndex = {
          indexName: searchIndexString,
          label: searchIndexString,
          active: true,
          indexType: 'activeMapItems',
        };
        return SearchActions.searchForTermFromUrlParams({searchTerm, searchIndex});
      }),
    );
  });

  public handleSearchUrlParameter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTermFromUrlParams),
      switchMap(({searchIndex, searchTerm}) => {
        return this.searchService.searchIndexes(searchTerm, [searchIndex]).pipe(
          map((results) => {
            if (results.length === 0 || !isGeometrySearchApiResultMatch(results[0])) {
              return SearchActions.handleEmptyResultsFromUrlSearch({searchTerm});
            }
            const mostSignificantResult = results[0];
            return SearchActions.selectMapSearchResult({searchResult: mostSignificantResult});
          }),
          catchError((error: unknown) => of(SearchActions.setSearchApiError({error}))),
        );
      }),
    );
  });

  public throwErrorForInvalidSearchParameters$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.handleInvalidParameters),
        tap(() => {
          throw new InvalidSearchParameters();
        }),
      );
    },
    {dispatch: false},
  );

  public throwErrorForEmptySearchResults$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.handleEmptyResultsFromUrlSearch),
        map(({searchTerm}) => {
          throw new NoSearchResultsFoundForParameters(searchTerm);
        }),
      );
    },
    {dispatch: false},
  );

  public resetSearchLoadingState$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.handleEmptyResultsFromUrlSearch, SearchActions.handleInvalidParameters),
      map(() => {
        return SearchActions.resetLoadingState();
      }),
    );
  });
}
