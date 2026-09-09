import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {map} from 'rxjs';
import {QueryModeActions} from '../actions/query-mode.actions';
import {MapUiActions} from '../actions/map-ui.actions';

@Injectable()
export class QueryModeEffects {
  private readonly actions$ = inject(Actions);

  /**
   * Selecting the statistics mode reveals its drawing submenu, mirroring how the drawing tool behaves. Leaving the mode closes the
   * submenu again so that no orphaned menu stays open for a mode that is no longer active.
   */
  public toggleStatisticsToolMenu$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      map(({queryMode}) => MapUiActions.toggleToolMenu({tool: queryMode === 'statistics' ? 'statistics' : undefined})),
    );
  });
}
