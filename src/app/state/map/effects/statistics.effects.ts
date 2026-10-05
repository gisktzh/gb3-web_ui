import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {catchError, distinctUntilChanged, filter, map, of, skip, switchMap, takeUntil, tap} from 'rxjs';
import {StatisticsActions} from '../actions/statistics.actions';
import {QueryModeActions} from '../actions/query-mode.actions';
import {ToolActions} from '../actions/tool.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {STATISTICS_SERVICE} from '../../../app.tokens';
import {selectStatisticsQueries} from '../selectors/statistics-queries.selector';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectActiveTool} from '../reducers/tool.reducer';
import {
  selectAreaInSquareMeters,
  selectCenter,
  selectGeometry,
  selectLoadingState,
  selectMode,
  selectRadiusInMeters,
} from '../reducers/statistics.reducer';
import {createCircle, deriveBoundingBoxCenter, isSameQueryPoint, moveGeometryTo} from '../../../shared/utils/statistics-geometry.utils';
import {findStatisticsModeForTool, statisticsSelectionToolByMode} from '../../../shared/types/statistics-selection-tool.type';
import {QueryLocationActions} from '../actions/query-location.actions';
import {selectScale} from '../reducers/map-config.reducer';
import {StatisticsAreaService} from '../../../shared/services/statistics-area.service';
import {maximumStatisticsAreaInSquareMeters} from '../../../shared/configs/statistics.config';
import {selectStatisticsHighlights} from '../selectors/statistics-highlights.selector';
import {selectStatisticsAreaToDraw} from '../selectors/query-graphics.selector';
import {selectIsStatisticsAvailable} from '../selectors/statistics-availability.selector';

@Injectable()
export class StatisticsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly statisticsService = inject(STATISTICS_SERVICE);
  private readonly areaService = inject(StatisticsAreaService);

  public validateSelection$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setSelection),
      switchMap(({geometry}) =>
        this.areaService.calculateArea(geometry).pipe(
          map((areaInSquareMeters) => StatisticsActions.setArea({areaInSquareMeters})),
          catchError((error: unknown) => of(StatisticsActions.setError({error}))),
          takeUntil(this.actions$.pipe(ofType(StatisticsActions.clearContent))),
        ),
      ),
    );
  });

  public invalidateOnLayerChanges$ = createEffect(() => {
    return this.store.select(selectStatisticsQueries).pipe(
      distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
      skip(1),
      map(() => StatisticsActions.invalidateContent()),
    );
  });

  public highlightResults$ = createEffect(
    () => {
      return this.store.select(selectStatisticsHighlights).pipe(
        filter(({ready}) => ready),
        tap(({geometries, queryMode}) => {
          if (queryMode === 'statistics') {
            this.mapDrawingService.drawStatisticsHighlights(geometries);
          } else {
            this.mapDrawingService.clearStatisticsHighlights();
          }
        }),
      );
    },
    {dispatch: false},
  );

  public renderSelection$ = createEffect(
    () => {
      return this.store.select(selectStatisticsAreaToDraw).pipe(
        filter(({ready}) => ready),
        tap(({geometry}) => {
          if (geometry) {
            this.mapDrawingService.drawStatisticsArea(geometry);
          } else {
            this.mapDrawingService.clearStatisticsArea();
          }
        }),
      );
    },
    {dispatch: false},
  );

  /**
   * Closing the info overlay discards the query it was showing. The feature info and the general info already clear themselves on this
   * action, and the statistics area has to disappear from the map with them rather than outliving the panel that explains it.
   */
  public clearOnFeatureInfoClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.clearFeatureInfoContent),
      map(() => StatisticsActions.clearContent()),
    );
  });

  /**
   * Changing the radius redraws the circle around the unchanged centre. Without a centre there is nothing to derive an area from, so
   * the new radius only takes effect once a location is known.
   */
  public deriveCircleFromRadius$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setRadius),
      concatLatestFrom(() => this.store.select(selectCenter)),
      filter(([, center]) => center !== undefined),
      map(([{radiusInMeters}, center]) =>
        StatisticsActions.setSelection({
          geometry: createCircle(center!, radiusInMeters),
          radiusInMeters: undefined,
        }),
      ),
    );
  });

  /**
   * Every map click also moves the area the statistics are calculated for, so that it is already in place when the user switches to the
   * statistics tab. In 'umkreis' mode the click defines the centre of a new circle, in 'polygon' mode it moves the drawn polygon along
   * without changing its shape. Without a polygon there is nothing to move yet, so the click is ignored until one has been drawn.
   */
  public recenterSelectionOnPointChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryLocationActions.setPoint),
      concatLatestFrom(() => [this.store.select(selectMode), this.store.select(selectGeometry), this.store.select(selectRadiusInMeters)]),
      map(([{point: center}, mode, geometry, radiusInMeters]) => {
        const midpoint = geometry ? deriveBoundingBoxCenter(geometry) : undefined;
        if (isSameQueryPoint(midpoint, center)) {
          return undefined;
        }

        const selection = geometry
          ? moveGeometryTo(geometry, center)
          : mode === 'umkreis'
            ? createCircle(center, radiusInMeters)
            : undefined;
        return selection ? StatisticsActions.setSelection({geometry: selection, radiusInMeters: undefined}) : undefined;
      }),
      filter((action) => action !== undefined),
    );
  });

  public synchronizeQueryPoint$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setSelection),
      concatLatestFrom(() => [this.store.select(selectCenter), this.store.select(selectScale)]),
      map(([{geometry}, point, scale]) => {
        const midpoint = deriveBoundingBoxCenter(geometry);
        if (!midpoint || isSameQueryPoint(point, midpoint)) {
          return undefined;
        }
        return QueryLocationActions.setPoint({point: midpoint, scale});
      }),
      filter((action) => action !== undefined),
    );
  });

  /**
   * Statistics are only ever requested for the tab that shows them. Deriving the area on every map click is cheap, but querying the
   * API for a tab the user may never open is not, so the request waits until the statistics tab is actually active.
   */
  public requestStatistics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setArea, StatisticsActions.invalidateContent),
      concatLatestFrom(() => [
        this.store.select(selectQueryMode),
        this.store.select(selectGeometry),
        this.store.select(selectAreaInSquareMeters),
        this.store.select(selectIsStatisticsAvailable),
      ]),
      filter(
        ([, queryMode, geometry, area, available]) =>
          available &&
          queryMode === 'statistics' &&
          geometry !== undefined &&
          area !== undefined &&
          area <= maximumStatisticsAreaInSquareMeters,
      ),
      map(() => StatisticsActions.sendRequest()),
    );
  });

  /** Picks up an area that was derived while the feature tab was active and for which no statistics have been loaded yet. */
  public requestStatisticsOnModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'statistics'),
      concatLatestFrom(() => [
        this.store.select(selectGeometry),
        this.store.select(selectLoadingState),
        this.store.select(selectAreaInSquareMeters),
        this.store.select(selectIsStatisticsAvailable),
      ]),
      filter(
        ([, geometry, loadingState, area, available]) =>
          available &&
          geometry !== undefined &&
          loadingState === undefined &&
          area !== undefined &&
          area <= maximumStatisticsAreaInSquareMeters,
      ),
      map(() => StatisticsActions.sendRequest()),
    );
  });

  /**
   * The results need the panel they are shown in, which the user may well have closed since the last query. The feature info opens its
   * panel on the same grounds, so both tabs behave the same way.
   */
  public openOverlayOnRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.sendRequest, StatisticsActions.setSelection),
      concatLatestFrom(() => this.store.select(selectQueryMode)),
      filter(([action, queryMode]) => action.type === StatisticsActions.sendRequest.type || queryMode === 'statistics'),
      map(() => MapUiActions.setFeatureInfoVisibility({isVisible: true})),
    );
  });

  /**
   * Switching between the two modes discards the area defined for the previous one, as a circle cannot be carried over into a polygon
   * or the other way round, and hands the corresponding tool to the user so that they can draw the new area right away. The tool is
   * only handed over if it is not the one already drawing, which is what keeps this from bouncing back and forth with the effect below.
   */
  public restartSelectionOnModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setMode),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      switchMap(([{mode}, activeTool]) => {
        const tool = statisticsSelectionToolByMode[mode];

        return activeTool === tool
          ? [StatisticsActions.clearContent()]
          : [StatisticsActions.clearContent(), ToolActions.activateTool({tool})];
      }),
    );
  });

  /**
   * The two selection tools can also be started from the tool bar, which bypasses the mode select in the panel. The mode follows the
   * tool so that the panel does not claim to be in a mode the map is not drawing.
   */
  public syncModeWithSelectionTool$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ToolActions.activateTool),
      map(({tool}) => findStatisticsModeForTool(tool)),
      filter((mode) => mode !== undefined),
      concatLatestFrom(() => this.store.select(selectMode)),
      filter(([mode, currentMode]) => mode !== currentMode),
      map(([mode]) => StatisticsActions.setMode({mode})),
    );
  });

  public loadStatistics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.sendRequest),
      concatLatestFrom(() => [
        this.store.select(selectGeometry),
        this.store.select(selectStatisticsQueries),
        this.store.select(selectAreaInSquareMeters),
      ]),
      switchMap(([, geometry, queries, area]) => {
        if (!geometry) {
          return of(StatisticsActions.clearContent());
        }
        if (area === undefined || area > maximumStatisticsAreaInSquareMeters) {
          return of(StatisticsActions.invalidateContent());
        }

        if (queries.length === 0) {
          return of(StatisticsActions.updateContent({results: []}));
        }
        return this.statisticsService.loadStatistics(geometry, queries).pipe(
          map((results) => StatisticsActions.updateContent({results})),
          catchError((error: unknown) => of(StatisticsActions.setError({error}))),
          takeUntil(
            this.actions$.pipe(ofType(StatisticsActions.setSelection, StatisticsActions.clearContent, StatisticsActions.invalidateContent)),
          ),
        );
      }),
    );
  });
}
