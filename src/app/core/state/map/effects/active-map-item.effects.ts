import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {EsriMapService} from '../../../../map/services/esri-map.service';
import {tap} from 'rxjs';

@Injectable()
export class ActiveMapItemEffects {
  public dispatchActiveMapItemAddEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.addActiveMapItem),
        tap((action) => {
          this.mapService.addMapItem(action);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemRemoveEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeActiveMapItem),
        tap((action) => {
          this.mapService.removeMapItem(action.id);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemClearEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeAllActiveMapItems),
        tap((action) => {
          this.mapService.removeAllMapItems();
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemSetOpacityEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setOpacity),
        tap((action) => {
          this.mapService.setOpacity(action.opacity, action.activeMapItem);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemSetVisibilityEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setVisibility),
        tap((action) => {
          this.mapService.setVisibility(action.visible, action.activeMapItem);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemSetSublayerVisibilityEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setSublayerVisibility),
        tap((action) => {
          this.mapService.setSublayerVisibility(action.visible, action.activeMapItem, action.layerId);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemReorderActiveMapItemEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.reorderActiveMapItem),
        tap((action) => {
          this.mapService.reorderMapItem(action.previousIndex, action.currentIndex);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemReorderSublayerEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.reorderSublayer),
        tap((action) => {
          this.mapService.reorderSublayer(action.activeMapItem, action.previousIndex, action.currentIndex);
        })
      );
    },
    {dispatch: false}
  );

  constructor(private readonly actions$: Actions, private readonly mapService: EsriMapService) {}
}
