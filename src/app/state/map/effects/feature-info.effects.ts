import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, iif, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Store} from '@ngrx/store';
import {selectQueryLayers} from '../selectors/query-layers.selector';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {MapConstants} from '../../../shared/constants/map.constants';
import {MapConfigActions} from '../actions/map-config.actions';

@Injectable()
export class FeatureInfoEffects {
  public interceptMapClick = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.handleMapClick),
      map(({x, y}) => FeatureInfoActions.sendRequest({x, y}))
    );
  });

  public dispatchFeatureInfoRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      tap(({x, y}) => {
        const geometryWithSrs: PointWithSrs = {srs: MapConstants.DEFAULT_SRS, type: 'Point', coordinates: [x, y]};
        this.mapDrawingService.drawFeatureQueryLocation(geometryWithSrs);
      }),
      concatLatestFrom(() => this.store.select(selectQueryLayers)),
      switchMap(([action, queryLayers]) =>
        iif(
          () => queryLayers.length > 0,
          this.topicsService.loadFeatureInfos(action.x, action.y, queryLayers).pipe(
            map((featureInfos) => {
              return FeatureInfoActions.updateFeatureInfo({featureInfos});
            }),
            catchError(() => EMPTY) // todo error handling
          ),
          of(FeatureInfoActions.updateFeatureInfo({featureInfos: []}))
        )
      )
    );
  });
  public closeFeatureInfo = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(FeatureInfoActions.clearFeatureInfoContent),
        tap(() => {
          this.mapDrawingService.clearFeatureQueryLocation();
        })
      );
    },
    {dispatch: false}
  );

  constructor(
    private readonly actions$: Actions,
    private readonly topicsService: Gb3TopicsService,
    private readonly mapDrawingService: MapDrawingService,
    private readonly store: Store
  ) {}
}
