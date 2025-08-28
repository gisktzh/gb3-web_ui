import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {tap} from 'rxjs';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapService} from '../../../map/interfaces/map.service';
import {selectMapConfigParams} from '../selectors/map-config-params.selector';
import {map} from 'rxjs';
import {UrlActions} from '../../app/actions/url.actions';
import {Store} from '@ngrx/store';
import {SearchActions} from '../../app/actions/search.actions';
import {InitialMapExtentService} from '../../../map/services/initial-map-extent.service';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MAP_SERVICE} from '../../../app.tokens';

@Injectable()
export class MapConfigEffects {
  private readonly actions$ = inject(Actions);
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly store = inject(Store);
  private readonly initialMapExtentService = inject(InitialMapExtentService);
  private readonly mapDrawingService = inject(MapDrawingService);

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

  public setMapCenterAndDrawHighlight$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigActions.setMapCenterAndDrawHighlight),
        tap(({center}) => {
          this.mapService.setMapCenter(center);
          this.mapDrawingService.drawSearchResultHighlight(center);
        }),
      );
    },
    {dispatch: false},
  );

  public updateMapPageQueryParams$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        MapConfigActions.setMapCenterAndDrawHighlight,
        MapConfigActions.setScale,
        MapConfigActions.setBasemap,
        MapConfigActions.setMapExtent,
      ),
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

  public setBaseMapAndInitialMaps$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(SearchActions.initializeSearchFromUrlParameters),
      map(({basemapId, initialMaps}) => {
        const {x, y, scale} = this.initialMapExtentService.calculateInitialExtent();
        return MapConfigActions.setInitialMapConfig({basemapId, initialMaps, x, y, scale});
      }),
    );
  });
}
