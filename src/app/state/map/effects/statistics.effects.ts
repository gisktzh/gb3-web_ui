import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {catchError, filter, map, of, switchMap, tap} from 'rxjs';
import {StatisticsActions} from '../actions/statistics.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {ConfigService} from '../../../shared/services/config.service';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {StatisticsService} from '../../../shared/services/apis/gb3/abstract-statistics.service';
import {selectCenter, selectGeometry, selectIsUserDefined, selectRadiusInMeters} from '../reducers/statistics.reducer';
import {createCircle} from '../../../shared/utils/statistics-geometry.utils';

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
        tap(({geometry}) => this.mapDrawingService.drawStatisticsArea(geometry)),
      );
    },
    {dispatch: false},
  );

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
          isUserDefined: true,
        }),
      ),
    );
  });

  /**
   * Every map click also defines where the statistics are calculated, so that the area is already in place when the user switches to
   * the statistics tab. An area the user has defined themselves is kept, as it would otherwise be lost on the next click.
   */
  public deriveCircleFromMapClick$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      concatLatestFrom(() => [this.store.select(selectIsUserDefined), this.store.select(selectRadiusInMeters)]),
      filter(([, isUserDefined]) => !isUserDefined),
      map(([{x, y}, , radiusInMeters]) => {
        const center: PointWithSrs = {
          type: 'Point',
          coordinates: [x, y],
          srs: this.configService.mapConfig.defaultMapConfig.srsId,
        };

        return StatisticsActions.setSelection({
          geometry: createCircle(center, radiusInMeters),
          center,
          radiusInMeters: undefined,
          isUserDefined: false,
        });
      }),
    );
  });

  public requestStatistics$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(StatisticsActions.setSelection),
      map(() => StatisticsActions.sendRequest()),
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
