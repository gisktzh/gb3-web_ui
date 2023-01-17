import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {EsriMapService} from '../../../../map/services/esri-map.service';
import {MapConfigurationActions} from '../actions/map-configuration.actions';

@Injectable()
export class MapConfigurationEffects {
  public dispatchManualScaleSetting$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigurationActions.setScale),
        tap(({scale}) => this.mapService.setScale(scale))
      );
    },
    {dispatch: false}
  );

  public dispatchResetScale$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigurationActions.resetExtent),
        tap(() => {
          this.mapService.resetExtent();
        })
      );
    },
    {dispatch: false}
  );

  public dispatchZoomChange$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapConfigurationActions.changeZoom),
        tap(({zoomType}) => {
          this.mapService.handleZoom(zoomType);
        })
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, private readonly mapService: EsriMapService) {}
}
