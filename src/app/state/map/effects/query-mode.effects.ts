import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {filter, map} from 'rxjs';
import {QueryModeActions} from '../actions/query-mode.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {FeatureFlagsService} from '../../../shared/services/feature-flags.service';

@Injectable()
export class QueryModeEffects {
  private readonly actions$ = inject(Actions);
  private readonly featureFlagsService = inject(FeatureFlagsService);

  /**
   * Nothing may put the application into the statistics mode while the tool is switched off. The buttons that select it are already
   * hidden behind the feature flag, but the mode could also arrive from restored state such as a share link, which must never be able
   * to reveal the tool on an environment that does not have it enabled.
   */
  public enforceFeatureFlag$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'statistics' && !this.featureFlagsService.getFeatureFlag('statisticsTool')),
      map(() => QueryModeActions.setQueryMode({queryMode: 'feature'})),
    );
  });

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
