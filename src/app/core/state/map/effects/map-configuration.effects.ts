import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {tap} from 'rxjs';
import {MapConfigurationActions} from '../actions/map-configuration.actions';
import {MapService} from '../../../../map/interfaces/map.service';
import {MAP_SERVICE} from '../../../../app.module';

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

  constructor(private readonly actions$: Actions, @Inject(MAP_SERVICE) private readonly mapService: MapService) {}
}
