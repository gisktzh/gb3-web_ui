import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {combineLatestWith, filter, of, switchMap, tap} from 'rxjs';
import {SearchActions} from '../actions/search.actions';
import {SearchResultMatch} from '../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {SearchService} from '../../../shared/services/apis/search/services/search.service';
import {Store} from '@ngrx/store';
import {catchError, map} from 'rxjs/operators';
import {SearchResultsCouldNotBeLoaded} from '../../../shared/errors/search.errors';
import {selectFilteredLayerCatalogMaps} from '../selectors/filtered-layer-catalog-maps.selector';
import {selectLoadingState} from '../../map/reducers/layer-catalog.reducer';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {selectActiveSearchFilterIndexes} from '../selectors/active-search-filter-indexes.selector';
import {ConfigService} from '../../../shared/services/config.service';

@Injectable()
export class SearchEffects {
  public searchResultsFromSearchService$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((value) => value.group.searchIndexTypes.length > 0),
      switchMap((value) => this.searchService.searchIndexes(value.term, value.group.searchIndexTypes)),
      concatLatestFrom(() => this.store.select(selectActiveSearchFilterIndexes)),
      map(([results, activeFilterIndexes]) => {
        // return SearchActions.setSearchServiceResults({results});
        // TODO WES remove
        const mockResults: SearchResultMatch[] = [
          {score: 5, displayString: 'yolo', geometry: {srs: 4326, type: 'Point', coordinates: []}, indexName: 'brolo'},
          {score: 2, displayString: 'swag', geometry: {srs: 4326, type: 'Point', coordinates: []}, indexName: 'brolo'},
        ];
        return SearchActions.setSearchServiceResults({results: mockResults});
      }),
      // catchError((error: unknown) => of(SearchActions.setSearchServiceError({error}))),
      // TODO WES remove
      catchError(() => {
        const mockResults: SearchResultMatch[] = [
          {score: 5, displayString: 'yolo', geometry: {srs: 4326, type: 'Point', coordinates: []}, indexName: 'brolo'},
          {score: 2, displayString: 'swag', geometry: {srs: 4326, type: 'Point', coordinates: []}, indexName: 'brolo'},
        ];
        return of(SearchActions.setSearchServiceResults({results: mockResults}));
      }),
    );
  });

  public throwSearchServiceError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.setSearchServiceError),
        tap(({error}) => {
          throw new SearchResultsCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  // TODO WES try to find optimization to only load layers IF they're searched for
  public loadLayerCatalogueForSearch$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((value) => value.group.maps),
      concatLatestFrom(() => this.store.select(selectLoadingState)),
      filter(([_, layerCatalogLoadingState]) => layerCatalogLoadingState === 'undefined'),
      map(() => LayerCatalogActions.loadLayerCatalog()),
    );
  });

  public searchResultsFromLayerCatalogue$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.searchForTerm),
      filter((value) => value.group.maps),
      combineLatestWith(this.store.select(selectLoadingState)),
      filter(([_, layerCatalogLoadingState]) => layerCatalogLoadingState === 'loaded' || layerCatalogLoadingState === 'error'),
      concatLatestFrom(() => this.store.select(selectFilteredLayerCatalogMaps)),
      map(([[_, layerCatalogLoadingState], filteredMaps]) => {
        if (layerCatalogLoadingState === 'error') {
          return SearchActions.setFilteredMapsError({});
        }
        return SearchActions.setFilteredMapsResults({filteredMaps});
      }),
    );
  });

  public throwLayerCatalogueError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.setFilteredMapsError),
        tap(({error}) => {
          throw new SearchResultsCouldNotBeLoaded(error);
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
  ) {}
}
