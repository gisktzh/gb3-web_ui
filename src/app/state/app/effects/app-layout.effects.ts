import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {AppLayoutActions} from '../actions/app-layout.actions';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {map} from 'rxjs';
import {MapUiActions} from '../../map/actions/map-ui.actions';

@Injectable()
export class AppLayoutEffects {
  public manageScreenModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppLayoutActions.setScreenMode),
      map(() => {
        return MapUiActions.resetMapUiState();
      }),
    );
  });
  public resetFilterStringOnScreenModeChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppLayoutActions.setScreenMode),
      map(() => {
        return LayerCatalogActions.clearFilterString();
      }),
    );
  });

  constructor(private readonly actions$: Actions) {}
}
