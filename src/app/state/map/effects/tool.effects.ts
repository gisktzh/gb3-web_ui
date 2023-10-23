import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {ToolActions} from '../actions/tool.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {map} from 'rxjs/operators';
import {MapUiActions} from '../actions/map-ui.actions';

@Injectable()
export class ToolEffects {
  private readonly toolService: ToolService;

  public initializeTool$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.activateTool),
        tap(({tool}) => {
          switch (tool) {
            case 'measure-line':
            case 'measure-point':
            case 'measure-area':
              this.toolService.initializeMeasurement(tool);
              break;
            case 'draw-point':
            case 'draw-line':
            case 'draw-polygon':
            case 'draw-rectangle':
            case 'draw-circle':
              this.toolService.initializeDrawing(tool);
              break;
            case 'select-circle':
            case 'select-polygon':
            case 'select-rectangle':
            case 'select-section':
            case 'select-canton':
            case 'select-municipality':
              this.toolService.initializeDataDownloadSelection(tool);
              break;
          }
        }),
      );
    },
    {dispatch: false},
  );

  public disableDragAndDropOnActiveTool$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ToolActions.activateTool),
      map(() => MapUiActions.disableActiveMapItemDragAndDrop()),
    );
  });

  public cancelOrDeactivateTool$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.cancelTool, ToolActions.deactivateTool),
        tap(() => this.toolService.cancelTool()),
      );
    },
    {dispatch: false},
  );

  public enableDragAndDropOnDeactivatedTool$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ToolActions.cancelTool, ToolActions.deactivateTool),
      map(() => MapUiActions.enableActiveMapItemDragAndDrop()),
    );
  });

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {
    this.toolService = this.mapService.getToolService();
  }
}
