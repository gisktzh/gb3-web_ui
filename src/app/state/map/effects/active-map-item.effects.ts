import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {tap} from 'rxjs';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {selectItems} from '../reducers/active-map-item.reducer';
import {Store} from '@ngrx/store';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {MapConfigActions} from '../actions/map-config.actions';
import {map} from 'rxjs/operators';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';

@Injectable()
export class ActiveMapItemEffects {
  public dispatchActiveMapItemAddEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.addActiveMapItem),
        tap(({activeMapItem, position}) => {
          activeMapItem.addToMap(this.mapService, position);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemRemoveEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeActiveMapItem),
        tap((action) => {
          this.mapService.removeMapItem(action.id);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemClearEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeAllActiveMapItems),
        tap((action) => {
          this.mapService.removeAllMapItems();
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemMoveToTop = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.moveToTop),
        tap(({activeMapItem}) => {
          this.mapService.moveLayerToTop(activeMapItem);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemForceFullVisibility = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.forceFullVisibility),
      tap(({activeMapItem}) => {
        this.mapService.setOpacity(1.0, activeMapItem);
        this.mapService.setVisibility(true, activeMapItem);
      }),
      map(({activeMapItem}) => ActiveMapItemActions.moveToTop({activeMapItem})),
    );
  });

  public dispatchActiveMapItemSetOpacityEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setOpacity),
        tap((action) => {
          this.mapService.setOpacity(action.opacity, action.activeMapItem);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemSetVisibilityEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setVisibility),
        tap((action) => {
          this.mapService.setVisibility(action.visible, action.activeMapItem);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemSetSublayerVisibilityEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setSublayerVisibility),
        tap((action) => {
          this.mapService.setSublayerVisibility(action.visible, action.activeMapItem, action.layerId);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemReorderActiveMapItemEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.reorderActiveMapItem),
        tap((action) => {
          this.mapService.reorderMapItem(action.previousPosition, action.currentPosition);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemReorderSublayerEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.reorderSublayer),
        tap((action) => {
          this.mapService.reorderSublayer(action.activeMapItem, action.previousPosition, action.currentPosition);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemSetTimeSliderExtentEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setTimeSliderExtent),
        tap((action) => {
          this.mapService.setTimeSliderExtent(action.timeExtent, action.activeMapItem);
        }),
      );
    },
    {dispatch: false},
  );

  public dispatchActiveMapItemSetActiveFiltersEffect$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.setAttributeFilterValueState),
        concatLatestFrom(() => this.store.select(selectItems)),
        tap(([action, activeMapItems]) => {
          const currentActiveMapItem = activeMapItems
            .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
            .find((activeMapItem) => activeMapItem.id === action.activeMapItem.id);
          if (currentActiveMapItem?.settings.filterConfigurations) {
            const attributeFilterParameters = this.gb3TopicsService.transformFilterConfigurationToParameters(
              currentActiveMapItem.settings.filterConfigurations,
            );
            this.mapService.setAttributeFilters(attributeFilterParameters, currentActiveMapItem);
          }
        }),
      );
    },
    {dispatch: false},
  );

  public addFavourite$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addFavourite),
      tap(
        ({
          activeMapItems,
          baseConfig: {
            scale,
            center: {x, y},
          },
        }) => {
          activeMapItems.forEach((fav, idx) => {
            this.mapService.removeMapItem(fav.id);
            fav.addToMap(this.mapService, idx);
          });

          const center: PointWithSrs = {type: 'Point', srs: 2056, coordinates: [x, y]};
          this.mapService.zoomToPoint(center, scale);
        },
      ),
      map(({baseConfig}) => MapConfigActions.setBasemap({activeBasemapId: baseConfig.basemap})),
    );
  });

  public dispatchInitialMapItemsAddEffect$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addInitialMapItems),
      tap(({initialMapItems}) => {
        initialMapItems.forEach((initialMapItem) => {
          initialMapItem.addToMap(this.mapService, 0);
        });
      }),
      map(() => MapConfigActions.clearInitialMapsConfig()),
    );
  });

  public setActiveMapItemsToTheMap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.setActiveMapItems),
      tap(({activeMapItems}) => {
        activeMapItems.forEach((activeMapItem) => {
          activeMapItem.addToMap(this.mapService, 0);
        });
      }),
      map(() => MapConfigActions.clearInitialMapsConfig()),
    );
  });

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly gb3TopicsService: Gb3TopicsService,
    private readonly store: Store,
  ) {}
}
