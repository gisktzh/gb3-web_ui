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
  public dispatchToolToggle = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.activateTool),
        tap(({tool}) => {
          switch (tool) {
            case 'measure-line':
            case 'measure-point':
            case 'measure-area':
              this.toolService.startMeasurement(tool);
              break;
          }
        })
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, @Inject(MAP_SERVICE) private readonly mapService: MapService) {
    this.toolService = this.mapService.getToolService();
  }
}
