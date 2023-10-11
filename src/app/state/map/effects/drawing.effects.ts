import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {filter} from 'rxjs';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {map} from 'rxjs/operators';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {DrawingActions} from '../actions/drawing.actions';

@Injectable()
export class DrawingEffects {
  public clearSingleDrawingLayer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeActiveMapItem),
      map((action) => action.activeMapItem),
      filter(isActiveMapItemOfType(DrawingActiveMapItem)),
      map((drawingLayer) => DrawingActions.clearDrawingLayer({layer: drawingLayer.settings.userDrawingLayer})),
    );
  });

  public clearAllDrawingLayers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeAllActiveMapItems),
      map(() => DrawingActions.clearDrawings()),
    );
  });

  constructor(private readonly actions$: Actions) {}
}
