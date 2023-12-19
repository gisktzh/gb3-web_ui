import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs/operators';
import {MAP_LOADER_SERVICE} from '../../../app.module';
import {of, switchMap, tap} from 'rxjs';
import {MapImportActions} from '../actions/map-import.actions';
import {MapLoaderService} from '../../../map/interfaces/map-loader.service';
import {ExternalServiceCouldNotBeLoaded} from '../../../shared/errors/map-import.errors';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';

@Injectable()
export class ExternalMapItemEffects {
  public loadExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExternalMapItemActions.loadItem),
      switchMap(({url, serviceType}) =>
        this.mapLoaderService.loadExternalService(url, serviceType).pipe(
          map((externalMapItem) => {
            return ExternalMapItemActions.setItem({externalMapItem});
          }),
          catchError((error: unknown) => of(ExternalMapItemActions.setItemError({error}))),
        ),
      ),
    );
  });

  public setLayersAndImageFormatFromExternalMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ExternalMapItemActions.setItem),
      map(({externalMapItem}) => {
        switch (externalMapItem.settings.mapServiceType) {
          case 'wms':
            return MapImportActions.setLayersAndImageFormat({
              layers: externalMapItem.settings.layers,
              imageFormat: externalMapItem.settings.imageFormat,
            });
          case 'kml':
            return MapImportActions.setLayersAndImageFormat({layers: externalMapItem.settings.layers});
        }
      }),
    );
  });

  public throwExternalMapItemError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ExternalMapItemActions.setItemError),
        tap(({error}) => {
          throw new ExternalServiceCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_LOADER_SERVICE) private readonly mapLoaderService: MapLoaderService,
  ) {}
}
