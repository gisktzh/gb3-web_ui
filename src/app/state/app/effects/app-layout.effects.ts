import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Injectable, inject} from '@angular/core';
import {AppLayoutActions} from '../actions/app-layout.actions';
import {LayerCatalogActions} from '../../map/actions/layer-catalog.actions';
import {distinctUntilChanged, filter, map} from 'rxjs';
import {MapUiActions} from '../../map/actions/map-ui.actions';
import {selectActiveTool} from '../../map/reducers/tool.reducer';
import {ToolActions} from '../../map/actions/tool.actions';
import {Store} from '@ngrx/store';

@Injectable()
export class AppLayoutEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);

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
}
