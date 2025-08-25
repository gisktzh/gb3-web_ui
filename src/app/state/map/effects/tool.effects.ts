import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {ToolActions} from '../actions/tool.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {MapService} from '../../../map/interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';

@Injectable()
export class ToolEffects {
  private readonly actions$ = inject(Actions);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

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
            case 'measure-circle':
              this.toolService.initializeMeasurement(tool);
              break;
            case 'measure-elevation-profile':
              this.toolService.initializeElevationProfileMeasurement();
              break;
            case 'draw-point':
            case 'draw-line':
            case 'draw-polygon':
            case 'draw-rectangle':
            case 'draw-circle':
            case 'draw-text':
              this.toolService.initializeDrawing(tool);
              break;
            case 'select-circle':
            case 'select-polygon':
            case 'select-rectangle':
            case 'select-section':
            case 'select-federation':
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

  public cancelOrDeactivateTool$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.cancelTool, ToolActions.deactivateTool),
        tap(() => this.toolService.cancelTool()),
      );
    },
    {dispatch: false},
  );

  constructor() {
    this.toolService = this.mapService.getToolService();
  }
}
