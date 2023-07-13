import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {ToolActions} from '../actions/tool.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';

@Injectable()
export class ToolEffects {
  private readonly toolService: ToolService;
  public dispatchToolActivation = createEffect(
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
          }
        })
      );
    },
    {dispatch: false}
  );
  public dispatchToolCancellation = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.cancelTool, ToolActions.deactivateTool),
        tap(() => this.toolService.cancelTool())
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, @Inject(MAP_SERVICE) private readonly mapService: MapService) {
    this.toolService = this.mapService.getToolService();
  }
}
