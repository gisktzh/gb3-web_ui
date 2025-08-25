import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {filter, tap} from 'rxjs';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {map} from 'rxjs';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {DrawingActions} from '../actions/drawing.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MapService} from '../../../map/interfaces/map.service';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {selectSelectedDrawing} from '../reducers/drawing.reducer';
import {DrawingNotFound} from '../../../shared/errors/drawing.errors';
import {MAP_SERVICE} from '../../../app.tokens';

@Injectable()
export class DrawingEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

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
      concatLatestFrom(() => this.store.select(selectSelectedDrawing)),
      map(([_, selectedDrawing]) => {
        if (!selectedDrawing) {
          throw new DrawingNotFound();
        }
        return MapUiActions.setDrawingEditOverlayVisibility({isVisible: true});
      }),
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

  public cancelEditModeAfterClosingDrawingEditOverlay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(DrawingActions.cancelEditMode),
      map(() => {
        this.mapService.cancelEditMode();
        return MapUiActions.setDrawingEditOverlayVisibility({isVisible: false});
      }),
    );
  });

  constructor() {
    this.toolService = this.mapService.getToolService();
  }
}
