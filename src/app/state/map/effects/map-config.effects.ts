import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {tap} from 'rxjs';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapService} from '../../../map/interfaces/map.service';
import {MAP_SERVICE} from '../../../app.module';
import {selectMapConfigParams} from '../selectors/map-config-params.selector';
import {map} from 'rxjs/operators';
import {UrlActions} from '../../app/actions/url.actions';
import {Store} from '@ngrx/store';

@Injectable()
export class MapConfigEffects {
  public setScaleOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.setScale),
        tap(({scale}) => this.mapService.setScale(scale)),
      );
    },
    {dispatch: false},
  );

  public resetExtentOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.resetExtent),
        tap(() => {
          this.mapService.resetExtent();
        }),
      );
    },
    {dispatch: false},
  );

  public changeZoomOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.changeZoom),
        tap(({zoomType}) => {
          this.mapService.handleZoom(zoomType);
        }),
      );
    },
    {dispatch: false},
  );

  public setCenterOnMap$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.setMapCenter),
        tap(({center}) => {
          this.mapService.setMapCenter(center);
        }),
      );
    },
    {dispatch: false},
  );

  public updateMapPageQueryParams$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.setMapCenter, MapConfigActions.setScale, MapConfigActions.setBasemap, MapConfigActions.setMapExtent),
      concatLatestFrom(() => this.store.select(selectMapConfigParams)),
      map(([_, params]) => UrlActions.setMapPageParams({params})),
    );
  });

  public updateMapRotation$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.handleMapRotation),
      map((rotation) => MapConfigActions.setRotation(rotation)),
    );
  });

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly store: Store,
  ) {}
}
