import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {iif, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Store} from '@ngrx/store';
import {selectQueryLayers} from '../selectors/query-layers.selector';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {MapConfigActions} from '../actions/map-config.actions';
import {ConfigService} from '../../../shared/services/config.service';

import {FeatureInfoCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {MapUiActions} from '../actions/map-ui.actions';

@Injectable()
export class FeatureInfoEffects {
  private readonly actions$ = inject(Actions);
  private readonly topicsService = inject(Gb3TopicsService);
  private readonly mapDrawingService = inject(MapDrawingService);
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);

  public clearData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.clearFeatureInfoContent),
      map(() => FeatureInfoActions.clearContent()),
    );
  });

  public interceptMapClick$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.handleMapClick),
      map(({x, y}) => FeatureInfoActions.sendRequest({x, y})),
    );
  });

  public openFeatureInfoOverlayOnRequest$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      map(() => MapUiActions.setFeatureInfoVisibility({isVisible: true})),
    );
  });

  public requestFeatureInfo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(FeatureInfoActions.sendRequest),
      tap(({x, y}) => {
        const geometryWithSrs: PointWithSrs = {
          srs: this.configService.mapConfig.defaultMapConfig.srsId,
          type: 'Point',
          coordinates: [x, y],
        };
        this.mapDrawingService.drawFeatureQueryLocation(geometryWithSrs);
      }),
      concatLatestFrom(() => this.store.select(selectQueryLayers)),
      switchMap(([action, queryLayers]) =>
        iif(
          () => queryLayers.length > 0,
          this.topicsService.loadFeatureInfos(action.x, action.y, queryLayers).pipe(
            map((featureInfos) => {
              return FeatureInfoActions.updateContent({featureInfos});
            }),
            catchError((error: unknown) => of(FeatureInfoActions.setError({error}))),
          ),
          of(FeatureInfoActions.updateContent({featureInfos: []})),
        ),
      ),
    );
  });

  public setError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(FeatureInfoActions.setError),
        tap(({error}) => {
          throw new FeatureInfoCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  public removeHighlightOnContentClear$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(FeatureInfoActions.clearContent),
        tap(() => {
          this.mapDrawingService.clearFeatureQueryLocation();
        }),
      );
    },
    {dispatch: false},
  );
}
