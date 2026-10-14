import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, takeUntil, tap} from 'rxjs';
import {catchError, map} from 'rxjs';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Gb3GeneralInfoService} from '../../../shared/services/apis/gb3/gb3-general-info.service';
import {GeneralInfoActions} from '../actions/general-info.actions';
import {MapConfigActions} from '../actions/map-config.actions';

import {GeneralInfoCouldNotBeLoaded} from '../../../shared/errors/map.errors';
import {QueryLocationActions} from '../actions/query-location.actions';

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

  public requestAtQueryPoint$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(QueryLocationActions.setPoint),
      map(({point, scale}) => GeneralInfoActions.sendRequest({x: point.coordinates[0], y: point.coordinates[1], scale})),
    );
  });

  public requestGeneralInfo = createEffect(() => {
    return this.actions$.pipe(
      ofType(GeneralInfoActions.sendRequest),
      switchMap(({x, y, scale}) =>
        this.generalInfoService.loadGeneralInfo(x, y, scale).pipe(
          map((generalInfo) => {
            return GeneralInfoActions.updateContent({generalInfo});
          }),
          catchError((error: unknown) => of(GeneralInfoActions.setError({error}))),
          takeUntil(this.actions$.pipe(ofType(QueryLocationActions.setPoint, MapConfigActions.clearFeatureInfoContent))),
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
