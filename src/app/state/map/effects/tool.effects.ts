import {ErrorHandler, Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {EMPTY, concatMap, filter, map, of, tap} from 'rxjs';
import {ToolActions} from '../actions/tool.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectInteraction, selectSequence} from '../reducers/tool.reducer';
import {MAP_SERVICE} from '../../../app.tokens';
import {StatisticsActions} from '../actions/statistics.actions';

@Injectable()
export class ToolEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly toolService = inject(MAP_SERVICE).getToolService();
  private readonly errorHandler = inject(ErrorHandler);
  private readonly interaction = this.store.selectSignal(selectInteraction);
  private readonly sequence = this.store.selectSignal(selectSequence);

  public closeEditOverlay$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        ToolActions.startCreation,
        ToolActions.startEditing,
        ToolActions.cancelInteraction,
        ToolActions.completeInteraction,
        ToolActions.interactionFailed,
      ),
      filter((action) => !('interactionId' in action) || this.interaction().kind === 'idle'),
      map(() => MapUiActions.setDrawingEditOverlayVisibility({isVisible: false})),
    );
  });

  public startInteraction$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ToolActions.startCreation, ToolActions.startEditing),
      concatMap((action) => {
        const interaction = this.interaction();
        if (interaction.kind === 'idle') return EMPTY;
        try {
          if (action.type === ToolActions.startEditing.type) this.toolService.startEditing(action.tool, action.target, interaction.id);
          else this.toolService.startCreation(action.tool, interaction.id);
          return EMPTY;
        } catch (error) {
          return of(ToolActions.interactionFailed({interactionId: interaction.id, error}));
        }
      }),
    );
  });

  public endInteraction$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.cancelInteraction, ToolActions.completeInteraction, ToolActions.interactionFailed),
        tap((action) => {
          if (action.type === ToolActions.cancelInteraction.type) this.toolService.cancelTool();
          else if (this.interaction().kind === 'idle') this.toolService.finishInteraction(action.interactionId);
        }),
      );
    },
    {dispatch: false},
  );

  public reportFailure$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ToolActions.interactionFailed),
        filter(({interactionId}) => interactionId === this.sequence()),
        tap(({error}) => this.errorHandler.handleError(error)),
      );
    },
    {dispatch: false},
  );
}
