import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs';
import {of, switchMap, tap} from 'rxjs';
import {MapImportActions} from '../actions/map-import.actions';
import {MapLoaderService} from '../../../map/interfaces/map-loader.service';
import {ExternalServiceCouldNotBeLoaded} from '../../../shared/errors/map-import.errors';
import {ExternalMapItemActions} from '../actions/external-map-item.actions';
import {MAP_LOADER_SERVICE} from '../../../app.tokens';

@Injectable()
export class ExternalMapItemEffects {
  private readonly actions$ = inject(Actions);
  private readonly mapLoaderService = inject<MapLoaderService>(MAP_LOADER_SERVICE);

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
}
