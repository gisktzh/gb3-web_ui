import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {catchError, filter, map, of, switchMap, tap} from 'rxjs';
import {StatisticsActions} from '../actions/statistics.actions';
import {QueryModeActions} from '../actions/query-mode.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {ToolActions} from '../actions/tool.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {ConfigService} from '../../../shared/services/config.service';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {StatisticsService} from '../../../shared/services/apis/gb3/abstract-statistics.service';
import {selectQueryMode} from '../reducers/query-mode.reducer';
import {selectCenter, selectGeometry, selectLoadingState, selectMode, selectRadiusInMeters} from '../reducers/statistics.reducer';
import {createCircle, moveGeometryTo} from '../../../shared/utils/statistics-geometry.utils';

@Injectable()
export class StatisticsEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly configService = inject(ConfigService);
  private readonly statisticsService = inject(StatisticsService);

  public drawSelection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(StatisticsActions.setSelection),
        concatLatestFrom(() => this.store.select(selectQueryMode)),
        filter(([, queryMode]) => queryMode === 'statistics'),
        tap(([{geometry}]) => this.mapDrawingService.drawStatisticsArea(geometry)),
      );
    },
    {dispatch: false},
  );

  /**
   * The area belongs to the statistics tab, so it is only drawn while that tab is active and removed again on the way back to the
   * features. The area itself stays in the state and therefore reappears unchanged when the tab is opened again.
   */
  public toggleAreaVisibility$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(QueryModeActions.setQueryMode),
        concatLatestFrom(() => this.store.select(selectGeometry)),
        tap(([{queryMode}, geometry]) => {
          if (queryMode === 'statistics' && geometry) {
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

  public clearSelection$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(StatisticsActions.clearContent),
        tap(() => this.mapDrawingService.clearStatisticsArea()),
      );
    },
    {dispatch: false},
  );

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
          center,
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
  public recenterSelectionOnMapClick$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      concatLatestFrom(() => [this.store.select(selectMode), this.store.select(selectGeometry), this.store.select(selectRadiusInMeters)]),
      map(([{x, y}, mode, geometry, radiusInMeters]) => {
        const center: PointWithSrs = {
          type: 'Point',
          coordinates: [x, y],
          srs: this.configService.mapConfig.defaultMapConfig.srsId,
        };

        if (mode === 'umkreis') {
          return StatisticsActions.setSelection({geometry: createCircle(center, radiusInMeters), center, radiusInMeters: undefined});
        }

        return geometry
          ? StatisticsActions.setSelection({geometry: moveGeometryTo(geometry, center), center, radiusInMeters: undefined})
          : undefined;
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
      ofType(StatisticsActions.setSelection),
      concatLatestFrom(() => this.store.select(selectQueryMode)),
      filter(([, queryMode]) => queryMode === 'statistics'),
      map(() => StatisticsActions.sendRequest()),
    );
  });

  /** Picks up an area that was derived while the feature tab was active and for which no statistics have been loaded yet. */
  public requestStatisticsOnModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryModeActions.setQueryMode),
      filter(({queryMode}) => queryMode === 'statistics'),
      concatLatestFrom(() => [this.store.select(selectGeometry), this.store.select(selectLoadingState)]),
      filter(([, geometry, loadingState]) => geometry !== undefined && loadingState === undefined),
      map(() => StatisticsActions.sendRequest()),
    );
  });

  /**
   * Switching between the two modes discards the area defined for the previous one, as a circle cannot be carried over into a polygon
   * or the other way round, and hands the corresponding tool to the user so that they can draw the new area right away.
   */
  public restartSelectionOnModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setMode),
      switchMap(({mode}) => [
        StatisticsActions.clearContent(),
        ToolActions.activateTool({tool: mode === 'polygon' ? 'select-statistics-polygon' : 'select-statistics-circle'}),
      ]),
    );
  });

  public loadStatistics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.sendRequest),
      concatLatestFrom(() => this.store.select(selectGeometry)),
      switchMap(([, geometry]) => {
        if (!geometry) {
          return of(StatisticsActions.clearContent());
        }

        return this.statisticsService.loadStatistics(geometry).pipe(
          map((results) => StatisticsActions.updateContent({results})),
          catchError((error: unknown) => of(StatisticsActions.setError({error}))),
        );
      }),
    );
  });
}
