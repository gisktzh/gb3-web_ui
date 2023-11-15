import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {GeneralInfoActions} from '../actions/general-info.actions';

import {GeneralInfoCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {ElevationProfileActions} from '../actions/elevation-profile.actions';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';

@Injectable()
export class ElevationProfileEffects {
  public requestElevationProfile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ElevationProfileActions.loadProfile),
      switchMap(() =>
        this.swisstopoApiService.loadElevationProfile().pipe(
          map((elevationProfile) => {
            return ElevationProfileActions.updateContent({data: elevationProfile});
          }),
          // todo LME: error handling
          catchError((error: unknown) => of(GeneralInfoActions.setError({error}))),
        ),
      ),
    );
  });

  // todo LME: errorhandling
  public setGeneralInfoError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(GeneralInfoActions.setError),
        tap(({error}) => {
          throw new GeneralInfoCouldNotBeLoaded(error);
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
