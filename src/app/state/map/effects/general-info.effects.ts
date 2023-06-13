import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {EMPTY, switchMap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {Gb3GeneralInfoService} from '../../../shared/services/apis/gb3/gb3-general-info.service';
import {GeneralInfoActions} from '../actions/general-info.actions';
import {MapConfigActions} from '../actions/map-config.actions';

@Injectable()
export class GeneralInfoEffects {
  public clearData = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.clearFeatureInfoContent),
      map(() => GeneralInfoActions.clearContent())
    );
  });

  public interceptMapClick = createEffect(() => {
    return this.actions$.pipe(
      ofType(MapConfigActions.handleMapClick),
      map(({x, y}) => GeneralInfoActions.sendRequest({x, y}))
    );
  });

  public dispatchGeneralInfoRequest = createEffect(() => {
    return this.actions$.pipe(
      ofType(GeneralInfoActions.sendRequest),
      switchMap(({x, y}) =>
        this.generalInfoService.loadGeneralInfo(x, y).pipe(
          map((generalInfo) => {
            return GeneralInfoActions.updateContent({generalInfo});
          }),
          catchError(() => EMPTY) // todo error handling
        )
      )
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly topicsService: Gb3TopicsService,
    private readonly generalInfoService: Gb3GeneralInfoService
  ) {}
}
