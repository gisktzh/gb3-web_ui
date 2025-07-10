import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Gb3GeneralInfoService} from '../../../shared/services/apis/gb3/gb3-general-info.service';
import {GeneralInfoActions} from '../actions/general-info.actions';
import {MapConfigActions} from '../actions/map-config.actions';

import {GeneralInfoCouldNotBeLoaded} from '../../../shared/errors/map.errors';

@Injectable()
export class GeneralInfoEffects {
  private readonly actions$ = inject(Actions);
  private readonly topicsService = inject(Gb3TopicsService);
  private readonly generalInfoService = inject(Gb3GeneralInfoService);

  public clearData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.clearFeatureInfoContent),
      map(() => GeneralInfoActions.clearContent()),
    );
  });

  public interceptMapClick$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.handleMapClick),
      map(({x, y}) => GeneralInfoActions.sendRequest({x, y})),
    );
  });

  public requestGeneralInfo = createEffect(() => {
    return this.actions$.pipe(
      ofType(GeneralInfoActions.sendRequest),
      switchMap(({x, y}) =>
        this.generalInfoService.loadGeneralInfo(x, y).pipe(
          map((generalInfo) => {
            return GeneralInfoActions.updateContent({generalInfo});
          }),
          catchError((error: unknown) => of(GeneralInfoActions.setError({error}))),
        ),
      ),
    );
  });

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
}
