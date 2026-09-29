import {inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {combineLatestWith, filter, map, tap} from 'rxjs';
import {MAP_SERVICE} from '../../../app.tokens';
import {MapService} from '../../../map/interfaces/map.service';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {SearchActions} from '../../app/actions/search.actions';
import {selectUrlState} from '../../app/reducers/url.reducer';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectReady} from '../reducers/map-config.reducer';

@Injectable()
export class MapSearchEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly mapDrawingService = inject(MapDrawingService);

  public zoomToAndHighlightSelectedSearchResult$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(SearchActions.selectMapSearchResult),
        combineLatestWith(this.store.select(selectReady)),
        filter(([, isMapViewReady]) => isMapViewReady),
        tap(([{searchResult}]) => {
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
        tap(() => this.mapDrawingService.clearSearchResultHighlight()),
      );
    },
    {dispatch: false},
  );
}
