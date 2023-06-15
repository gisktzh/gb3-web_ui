import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {ToolActions} from '../actions/tool.actions';
import {ToolService} from '../../../map/interfaces/tool.service';
import {TOOL_SERVICE} from '../../../app.module';

@Injectable()
export class ToolEffects {
  public dispatchToggleTestDrawing = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.toggle),
        tap(() => this.toolService.testDrawing())
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, @Inject(TOOL_SERVICE) private readonly toolService: ToolService) {}
}
