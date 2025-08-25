import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable, inject} from '@angular/core';
import {filter, map} from 'rxjs';
import {UrlActions} from '../actions/url.actions';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {AppActions} from '../actions/app.actions';

@Injectable()
export class AppEffects {
  private readonly actions$ = inject(Actions);

  public handleDevModeParameter$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UrlActions.setAppParams),
      map((action) => action.params[RouteParamConstants.DEV_MODE_PARAMETER]),
      filter((devModeParam) => devModeParam === 'true'),
      map(() => AppActions.activateDevMode()),
    );
  });
}
