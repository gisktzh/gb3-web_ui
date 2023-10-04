import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {AppLayoutActions} from '../actions/app-layout.actions';
import {map} from 'rxjs';
import {MapUiActions} from '../../map/actions/map-ui.actions';

@Injectable()
export class AppLayoutEffects {
  public manageScreenModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppLayoutActions.setScreenMode),
      //filter(({screenMode}) => screenMode !== 'smallTablet'),
      map(({screenMode}) => {
        if (screenMode === 'mobile') {
          return MapUiActions.hideAllWidgets();
        } else {
          return MapUiActions.showUiElements();
        }
      }),
    );
  });

  constructor(private readonly actions$: Actions) {}
}
