import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';
import {ElevationProfileCouldNotBeLoaded} from '../../../shared/errors/elevation-profile.errors';

@Injectable()
export class ElevationProfileEffects {
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
  ) {}
}
