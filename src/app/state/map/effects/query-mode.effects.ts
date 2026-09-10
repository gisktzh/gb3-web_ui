import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {filter, map} from 'rxjs';
import {QueryModeActions} from '../actions/query-mode.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectToolMenuVisibility} from '../reducers/map-ui.reducer';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectActiveTool} from '../reducers/tool.reducer';
import {FeatureFlagsService} from '../../../shared/services/feature-flags.service';
import {statisticsSelectionTools} from '../../../shared/types/statistics-selection-tool.type';
import {QueryMode} from '../../../shared/types/query-mode.type';

@Injectable()
export class QueryModeEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
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

  /** Selecting the statistics mode reveals its drawing submenu, mirroring how the drawing tool behaves. */
  public openStatisticsToolMenu$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'statistics'),
      concatLatestFrom(() => this.store.select(selectToolMenuVisibility)),
      filter(([, toolMenuVisibility]) => toolMenuVisibility !== 'statistics'),
      map(() => MapUiActions.toggleToolMenu({tool: 'statistics'})),
    );
  });

  /**
   * Leaving the statistics mode closes its submenu, but only if that submenu is the one currently open. The mode is also left when
   * another tool menu is opened, and that menu has to stay open.
   */
  public closeStatisticsToolMenu$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'feature'),
      concatLatestFrom(() => this.store.select(selectToolMenuVisibility)),
      filter(([, toolMenuVisibility]) => toolMenuVisibility === 'statistics'),
      map(() => MapUiActions.toggleToolMenu({tool: 'feature'})),
    );
  });

  /**
   * The tool bar is the single source of truth for which tool owns the map interaction, so the query mode follows it: only the
   * statistics tool queries statistics, every other tool leaves the map clicks to the object query. The comparison against the current
   * mode keeps this from bouncing back and forth with the two effects above, which synchronise the opposite direction.
   */
  public syncQueryModeWithToolMenu$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.toggleToolMenu),
      map(({tool}): QueryMode => (tool === 'statistics' ? 'statistics' : 'feature')),
      concatLatestFrom(() => this.store.select(selectQueryMode)),
      filter(([queryMode, currentQueryMode]) => queryMode !== currentQueryMode),
      map(([queryMode]) => QueryModeActions.setQueryMode({queryMode})),
    );
  });

  /** A statistics selection tool belongs to the statistics mode and must not stay active once that mode has been left. */
  public cancelStatisticsToolOnLeavingMode$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'feature'),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      filter(([, activeTool]) => activeTool !== undefined && (statisticsSelectionTools as readonly string[]).includes(activeTool)),
      map(() => ToolActions.cancelTool()),
    );
  });
}
