import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
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
import {selectData} from '../reducers/elevation-profile.reducer';
import {Store} from '@ngrx/store';

@Injectable()
export class ElevationProfileEffects {
  public resetProfileDrawing$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ElevationProfileActions.clearProfile),
        tap(() => this.mapService.clearInternalDrawingLayer(InternalDrawingLayer.ElevationProfile)),
      );
    },
    {dispatch: false},
  );

  public clearExistingElevationProfilesOnNew$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ToolActions.activateTool),
      filter(({tool}) => tool === 'measure-elevation-profile'),
      map(() => ElevationProfileActions.clearProfile()),
    );
  });

  public clearExistingElevationProfileOnClose$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.setElevationProfileOverlayVisibility),
      filter(({isVisible}) => !isVisible),
      map(() => ElevationProfileActions.clearProfile()),
    );
  });

  public clearExistingElevationProfileOnMapUiReset$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapUiActions.resetMapUiState),
      concatLatestFrom(() => this.store.select(selectData)),
      filter(([_, data]) => !!data),
      map(() => {
        return ElevationProfileActions.clearProfile();
      }),
    );
  });

  public requestElevationProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ElevationProfileActions.loadProfile),
      switchMap(({geometry}) =>
        this.swisstopoApiService.loadElevationProfile(geometry).pipe(
          map((elevationProfile) => {
            return ElevationProfileActions.setProfile({data: elevationProfile});
          }),
          catchError((error: unknown) => of(ElevationProfileActions.setProfileError({error}))),
        ),
      ),
    );
  });

  public setElevationProfileError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ElevationProfileActions.setProfileError),
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
    private readonly store: Store,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
  ) {}
}
