import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {filter, of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';
import {ElevationProfileCouldNotBeLoaded} from '../../../shared/errors/elevation-profile.errors';
import {MapService} from '../../../map/interfaces/map.service';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ToolActions} from '../actions/tool.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {selectData} from '../reducers/elevation-profile.reducer';
import {Store} from '@ngrx/store';
import {MapDrawingService} from '../../../map/services/map-drawing.service';
import {MAP_SERVICE} from '../../../app.tokens';

@Injectable()
export class ElevationProfileEffects {
  private readonly actions$ = inject(Actions);
  private readonly swisstopoApiService = inject(SwisstopoApiService);
  private readonly store = inject(Store);
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly mapDrawingService = inject(MapDrawingService);

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

  public drawElevationProfileLocation$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ElevationProfileActions.drawElevationProfileHoverLocation),
        tap(({location}) => {
          this.mapDrawingService.drawElevationProfileHoverLocation(location);
        }),
      );
    },
    {dispatch: false},
  );

  public removeElevationProfileLocation$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ElevationProfileActions.removeElevationProfileHoverLocation),
        tap(() => {
          this.mapDrawingService.removeElevationProfileHoverLocation();
        }),
      );
    },
    {dispatch: false},
  );
}
