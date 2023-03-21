import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {tap, withLatestFrom} from 'rxjs';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {Store} from '@ngrx/store';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';

@Injectable()
export class ActiveMapItemEffects {
  public dispatchActiveMapItemAddEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.addActiveMapItem),
        tap((action) => {
          this.mapService.addMapItem(action.activeMapItem, action.position);
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
          this.mapService.reorderMapItem(action.previousPosition, action.currentPosition);
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
          this.mapService.reorderSublayer(action.activeMapItem, action.previousPosition, action.currentPosition);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemSetTimeSliderExtentEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setTimeSliderExtent),
        tap((action) => {
          this.mapService.setTimeSliderExtent(action.timeExtent, action.activeMapItem);
        })
      );
    },
    {dispatch: false}
  );

  public dispatchActiveMapItemSetActiveFiltersEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setAttributeFilterValueState),
        withLatestFrom(this.store.select(selectActiveMapItems)),
        tap(([action, activeMapItems]) => {
          const currentActiveMapItem = activeMapItems.find((activeMapItem) => activeMapItem.id === action.activeMapItem.id);
          if (currentActiveMapItem?.filterConfigurations) {
            const attributeFilterParameters = this.gb3TopicsService.transformFilterConfigurationToParameters(
              currentActiveMapItem.filterConfigurations
            );
            this.mapService.setAttributeFilters(attributeFilterParameters, currentActiveMapItem);
          }
        })
      );
    },
    {dispatch: false}
  );

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly gb3TopicsService: Gb3TopicsService,
    private readonly store: Store
  ) {}
}
