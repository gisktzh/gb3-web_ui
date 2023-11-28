import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {Injectable} from '@angular/core';
import {AppLayoutActions} from '../actions/app-layout.actions';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {distinctUntilChanged, filter, map} from 'rxjs';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {selectActiveTool} from '../../map/reducers/tool.reducer';
import {ToolActions} from '../../map/actions/tool.actions';
import {Store} from '@ngrx/store';

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

  public cancelToolAfterChangingToMobile$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppLayoutActions.setScreenMode),
      distinctUntilChanged((previous, current) => previous.screenMode === current.screenMode),
      concatLatestFrom(() => this.store.select(selectActiveTool)),
      filter(([{screenMode}, activeTool]) => screenMode === 'mobile' && activeTool !== undefined),
      map(() => ToolActions.cancelTool()),
    );
  });

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {}
}
