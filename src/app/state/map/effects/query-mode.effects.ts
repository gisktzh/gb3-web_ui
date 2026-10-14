import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {createSelector, Store} from '@ngrx/store';
import {concatMap, filter, map} from 'rxjs';
import {QueryModeActions} from '../actions/query-mode.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectToolMenuVisibility} from '../reducers/map-ui.reducer';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectActiveTool} from '../reducers/tool.reducer';
import {selectIsStatisticsAvailable} from '../selectors/statistics-availability.selector';
import {findStatisticsModeForTool, statisticsSelectionTools} from '../../../shared/types/statistics-selection-tool.type';
import {QueryMode} from '../../../shared/types/query-mode.type';

const selectNeedsFeatureMode = createSelector(
  selectIsStatisticsAvailable,
  selectQueryMode,
  selectToolMenuVisibility,
  (available, queryMode, toolMenu) => !available && (queryMode === 'statistics' || toolMenu === 'statistics'),
);

@Injectable()
export class QueryModeEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

  // Explicit selection takes map ownership; menu-driven synchronization must not cancel the newly selected tool.
  public selectQueryMode$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.selectQueryMode),
      concatLatestFrom(() => this.store.select(selectIsStatisticsAvailable)),
      map(([{queryMode}, available]): QueryMode => (queryMode === 'statistics' && !available ? 'feature' : queryMode)),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      concatMap(([queryMode, activeTool]) => [
        ...(activeTool && (queryMode === 'feature' || findStatisticsModeForTool(activeTool) === undefined)
          ? [ToolActions.cancelTool()]
          : []),
        MapUiActions.toggleToolMenu({tool: queryMode}),
      ]),
    );
  });

  public enforceStatisticsAvailability$ = createEffect(() => {
    return this.store.select(selectNeedsFeatureMode).pipe(
      filter((needsFeatureMode) => needsFeatureMode),
      map(() => QueryModeActions.setQueryMode({queryMode: 'feature'})),
    );
  });

  /** Selecting the statistics mode reveals its drawing submenu, mirroring how the drawing tool behaves. */
  public openStatisticsToolMenu$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'statistics'),
      concatLatestFrom(() => [this.store.select(selectToolMenuVisibility), this.store.select(selectIsStatisticsAvailable)]),
      filter(([, toolMenuVisibility, available]) => available && toolMenuVisibility !== 'statistics'),
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
      concatLatestFrom(() => this.store.select(selectIsStatisticsAvailable)),
      map(([{tool}, available]): QueryMode => (tool === 'statistics' && available ? 'statistics' : 'feature')),
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
