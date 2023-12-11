import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {catchError, map} from 'rxjs/operators';
import {MAP_LOADER_SERVICE} from '../../../app.module';
import {of, switchMap, tap} from 'rxjs';
import {MapImportActions} from '../actions/map-import.actions';
import {MapLoaderService} from '../../../map/interfaces/map-loader.service';
import {ExternalServiceCouldNotBeLoaded} from '../../../shared/errors/map-import.errors';

@Injectable()
export class MapImportEffects {
  public loadTemporaryExternalMap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapImportActions.loadTemporaryExternalMap),
      switchMap(({url, serviceType}) =>
        this.mapLoaderService.loadExternalService(url, serviceType).pipe(
          map((temporaryExternalMapItem) => {
            return MapImportActions.setTemporaryExternalMap({temporaryExternalMapItem});
          }),
          catchError((error: unknown) => of(MapImportActions.setTemporaryExternalMapError({error}))),
        ),
      ),
    );
  });

  public throwLoadTemporaryExternalMapError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(MapImportActions.setTemporaryExternalMapError),
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
