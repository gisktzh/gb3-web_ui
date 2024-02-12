import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {combineLatestWith, distinctUntilChanged, filter, of, switchMap, takeWhile, tap} from 'rxjs';
import {SearchActions} from '../actions/search.actions';
import {SearchService} from '../../../shared/services/apis/search/services/search.service';
import {Store} from '@ngrx/store';
import {catchError, map} from 'rxjs/operators';
import {SearchResultsCouldNotBeLoaded} from '../../../shared/errors/search.errors';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {selectAvailableSpecialSearchIndexes} from '../../map/selectors/available-search-index.selector';
import {ConfigService} from '../../../shared/services/config.service';
import {selectLoadingState as selectDataCatalogueLoadingState} from '../../data-catalogue/reducers/data-catalogue.reducer';
import {DataCatalogueActions} from '../../data-catalogue/actions/data-catalogue.actions';
import {SearchIndexType} from '../../../shared/configs/search-index.config';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {selectUrlState} from '../reducers/url.reducer';

@Injectable()
export class SearchEffects {
  public searchResultsFromSearchApi$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((termAndOptions) => termAndOptions.options.searchIndexTypes.length > 0),
      combineLatestWith(
        this.store
          .select(selectAvailableSpecialSearchIndexes)
          // simplified 'distinctUntilChanged' due to the fact that it is not possible to add and remove active map items with new search indexes at the same time;
          // therefore, comparing the amount of previous and current search indexes suffices to distinct between new indexes
          .pipe(distinctUntilChanged((previous, current) => previous.length === current.length)),
      ),
      takeWhile(([termAndOptions, _]) => termAndOptions.options.searchIndexTypes.length > 0),
      switchMap(([termAndOptions, activeMapIndexes]) => {
        const searchIndexes = this.configService.filterSearchIndexes(termAndOptions.options.searchIndexTypes);
        if (termAndOptions.options.searchIndexTypes.includes('activeMapItems')) {
          searchIndexes.push(...activeMapIndexes);
        }
        return this.searchService.searchIndexes(termAndOptions.term, searchIndexes).pipe(
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
        tap(({error}) => {
          throw new SearchResultsCouldNotBeLoaded(error);
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
        tap(({searchResult}) => {
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

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly searchService: SearchService,
    private readonly configService: ConfigService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly mapDrawingService: MapDrawingService,
  ) {}
}
