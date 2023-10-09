import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs/operators';
import {DataDownloadActions} from '../actions/data-download.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {tap} from 'rxjs';
import {MapDrawingService} from '../../../map/services/map-drawing.service';

const DEFAULT_SELECTION_ZOOM_ANIMATION_DURATION_IN_MS = 500;
const DEFAULT_SELECTION_ZOOM_EXPAND_FACTOR = 1.5;

@Injectable()
export class DataDownloadEffects {
  public openDataDownloadDrawerAfterCompletingSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DataDownloadActions.setSelection),
      map(({selection}) => {
        this.mapService.zoomToExtent(
          selection.drawingRepresentation.geometry,
          DEFAULT_SELECTION_ZOOM_EXPAND_FACTOR,
          DEFAULT_SELECTION_ZOOM_ANIMATION_DURATION_IN_MS,
        );
        return MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'data-download'});
      }),
    );
  });

  public clearSelectionAfterClosingDataDownloadDrawer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.hideMapSideDrawerContent),
      map(() => DataDownloadActions.clearSelection()),
    );
  });

  public clearGeometryFromMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DataDownloadActions.clearSelection),
        tap(() => {
          this.mapDrawingService.clearDataDownloadSelection();
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly mapDrawingService: MapDrawingService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}
}
