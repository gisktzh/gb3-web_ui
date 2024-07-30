import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {filter, tap} from 'rxjs';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {map} from 'rxjs/operators';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {DrawingActions} from '../actions/drawing.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MapService} from '../../../map/interfaces/map.service';
import {MAP_SERVICE} from '../../../app.module';

@Injectable()
export class DrawingEffects {
  private readonly toolService: ToolService;

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

  public editDrawing$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DrawingActions.selectDrawing),
      map(() => MapUiActions.setDrawingEditOverlayVisibility({isVisible: true})),
    );
  });

  public closeDrawingEditOverlayAfterFinishEditingOrDeleting$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DrawingActions.addDrawing, DrawingActions.addDrawings, DrawingActions.deleteDrawing),
      map(() => MapUiActions.setDrawingEditOverlayVisibility({isVisible: false})),
    );
  });

  public passStylingToToolService$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(DrawingActions.updateDrawingStyles),
        tap(({drawing, style, labelText}) => {
          this.toolService.updateDrawingStyles(drawing, style, labelText);
        }),
      );
    },
    {dispatch: false},
  );

  public cancelToolAfterClosingDrawingEditOverlay$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapUiActions.setDrawingEditOverlayVisibility),
        filter(({isVisible}) => !isVisible),
        tap(() => this.toolService.cancelTool()),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {
    this.toolService = this.mapService.getToolService();
  }
}
