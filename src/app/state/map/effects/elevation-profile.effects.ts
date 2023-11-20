import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';
import {ElevationProfileCouldNotBeLoaded} from '../../../shared/errors/elevation-profile.errors';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ToolActions} from '../actions/tool.actions';
import {MapUiActions} from '../actions/map-ui.actions';

@Injectable()
export class ElevationProfileEffects {
  public clearExistingElevationProfilesOnNew$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ToolActions.activateTool),
      filter(({tool}) => tool === 'measure-elevation-profile'),
      tap(() => {
        this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.ElevationProfile);
      }),
      map(() => ElevationProfileActions.clearProfile()),
    );
  });

  public clearExistingElevationProfileOnClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setElevationProfileOverlayVisibility),
      filter(({isVisible}) => !isVisible),
      tap(() => {
        this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.ElevationProfile);
      }),
      map(() => ElevationProfileActions.clearProfile()),
    );
  });

  public requestElevationProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ElevationProfileActions.loadProfile),
      switchMap(({geometry}) =>
        this.swisstopoApiService.loadElevationProfile(geometry).pipe(
          map((elevationProfile) => {
            return ElevationProfileActions.updateContent({data: elevationProfile});
          }),
          catchError((error: unknown) => of(ElevationProfileActions.setError({error}))),
        ),
      ),
    );
  });

  public setElevationProfileError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ElevationProfileActions.setError),
        tap(({error}) => {
          throw new ElevationProfileCouldNotBeLoaded(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    private readonly swisstopoApiService: SwisstopoApiService,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}
}
