import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {combineLatestWith, distinctUntilChanged, filter, of, switchMap, takeWhile, tap} from 'rxjs';
import {SearchActions} from '../actions/search.actions';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {SearchService} from '../../../shared/services/apis/search/services/search.service';
import {Store} from '@ngrx/store';
import {catchError, map} from 'rxjs/operators';
import {SearchResultsCouldNotBeLoaded} from '../../../shared/errors/search.errors';
import {selectFilteredLayerCatalogMaps} from '../selectors/filtered-layer-catalog-maps.selector';
import {selectLoadingState} from '../../map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {selectAvailableSpecialSearchIndexes} from '../../map/selectors/available-search-index.selector';
import {ConfigService} from '../../../shared/services/config.service';

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
          // TODO WES remove
          catchError(() => {
            const mockResults: SearchApiResultMatch[] = [
              {
                score: 1,
                displayString: 'test-addresses',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'fme-addresses',
                indexType: 'addresses',
              },
              {
                score: 2,
                displayString: 'test-places',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'fme-places',
                indexType: 'places',
              },
              {
                score: 3,
                displayString: 'test-activeMapItems1',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'KbS',
                indexType: 'activeMapItems',
              },
              {
                score: 4,
                displayString: 'test-activeMapItems2',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'Gvz',
                indexType: 'activeMapItems',
              },
              {
                score: 5,
                displayString: 'test-metadata-products',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'fme-meta-products',
                indexType: 'metadata-products',
              },
              {
                score: 6,
                displayString: 'test-metadata-datasets',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'fme-meta-datasets',
                indexType: 'metadata-datasets',
              },
              {
                score: 7,
                displayString: 'test-metadata-services',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'fme-meta-datasets',
                indexType: 'metadata-services',
              },
              {
                score: 8,
                displayString: 'test-metadata-maps',
                geometry: {srs: 4326, type: 'Point', coordinates: []},
                indexName: 'fme-meta-datasets',
                indexType: 'metadata-maps',
              },
            ];
            return of(SearchActions.setSearchApiResults({results: mockResults}));
          }),
          // TODO WES enable
          // catchError((error: unknown) => of(SearchActions.setSearchApiError({error}))),
        );
      }),
    );
  });

  // public searchAfterActiveMapItemsChange$ = createEffect(() => {
  //   return this.actions$.pipe(
  //     ofType(SearchActions.searchForTerm),
  //     filter((termAndOptions) => termAndOptions.options.searchIndexTypes.some((indexType) => indexType === 'activeMapItems')),
  //     combineLatestWith(this.store.select(selectAvailableSpecialSearchIndexes)),
  //     takeWhile(([termAndOptions, _]) => termAndOptions.options.searchIndexTypes.some((indexType) => indexType === 'activeMapItems')),
  //     distinctUntilChanged(),
  //     skip(1),
  //     map(([_, availableSpecialSearchIndexes]) =>
  //       SearchActions.searchForTerm(termAndOptions),
  //     ),
  //   );
  // });

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
      concatLatestFrom(() => this.store.select(selectLoadingState)),
      filter(([_, layerCatalogLoadingState]) => layerCatalogLoadingState === 'undefined'),
      map(() => LayerCatalogActions.loadLayerCatalog()),
    );
  });

  public searchResultsFromLayerCatalogue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((value) => value.options.maps),
      combineLatestWith(this.store.select(selectLoadingState)),
      filter(([_, layerCatalogLoadingState]) => layerCatalogLoadingState === 'loaded' || layerCatalogLoadingState === 'error'),
      concatLatestFrom(() => this.store.select(selectFilteredLayerCatalogMaps)),
      map(([[_, layerCatalogLoadingState], mapMatches]) => {
        if (layerCatalogLoadingState === 'error') {
          return SearchActions.setMapMatchesError({});
        }
        return SearchActions.setMapMatchesResults({mapMatches});
      }),
    );
  });

  public throwLayerCatalogueError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.setMapMatchesError),
        tap(({error}) => {
          throw new SearchResultsCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

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

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly searchService: SearchService,
    private readonly configService: ConfigService,
  ) {}
}
