import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {filter, tap} from 'rxjs';
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
import {selectIsMapServiceInitialized} from '../reducers/map-config.reducer';
import {MapUiActions} from '../actions/map-ui.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {selectActiveTool} from '../reducers/tool.reducer';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ToolActions} from '../actions/tool.actions';
import {ConfigService} from '../../../shared/services/config.service';

@Injectable()
export class ActiveMapItemEffects {
  public addMapItem$ = createEffect(
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

  public removeMapItem$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeActiveMapItem),
        tap((action) => {
          this.mapService.removeMapItem(action.activeMapItem.id);
        }),
      );
    },
    {dispatch: false},
  );

  public removeAllMapItems$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.removeAllActiveMapItems),
        tap(() => {
          this.mapService.removeAllMapItems();
        }),
      );
    },
    {dispatch: false},
  );

  public cancelToolAfterRemovingAllCorrespondingMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeActiveMapItem, ActiveMapItemActions.removeAllActiveMapItems),
      concatLatestFrom(() => [this.store.select(selectItems), this.store.select(selectActiveTool)]),
      filter(([action, activeMapItems, activeTool]) => {
        if (activeTool === undefined) {
          return false;
        }
        switch (action.type) {
          case '[ActiveMapItem] Remove Active Map Item':
            let activeUserDrawingLayer: UserDrawingLayer;
            switch (activeTool) {
              case 'measure-line':
              case 'measure-point':
              case 'measure-area':
                activeUserDrawingLayer = UserDrawingLayer.Measurements;
                break;
              case 'draw-point':
              case 'draw-line':
              case 'draw-polygon':
              case 'draw-rectangle':
              case 'draw-circle':
                activeUserDrawingLayer = UserDrawingLayer.Drawings;
                break;
            }
            // is there still a drawing item for the current active tool? if not => cancel tool
            return !activeMapItems.some(
              (item) => item.settings.type === 'drawing' && item.settings.userDrawingLayer === activeUserDrawingLayer,
            );
          case '[ActiveMapItem] Remove All Active Map Items':
            return true;
        }
      }),
      map(() => ToolActions.cancelTool()),
    );
  });

  public hideLegendAfterRemovingAllMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeAllActiveMapItems),
      map(() => MapUiActions.setLegendOverlayVisibility({isVisible: false})),
    );
  });

  public clearFeatureInfoContentAfterRemovingAllMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeAllActiveMapItems),
      map(() => FeatureInfoActions.clearContent()),
    );
  });

  public moveToTop$ = createEffect(
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

  public forceFullVisibility$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.forceFullVisibility),
      tap(({activeMapItem}) => {
        this.mapService.setOpacity(1.0, activeMapItem);
        this.mapService.setVisibility(true, activeMapItem);
      }),
      map(({activeMapItem}) => ActiveMapItemActions.moveToTop({activeMapItem})),
    );
  });

  public setOpacity$ = createEffect(
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

  public setItemVisibility$ = createEffect(
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

  public setSublayerVisibility$ = createEffect(
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

  public reorderItem$ = createEffect(
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

  public reorderSublayer$ = createEffect(
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

  public setTimeSliderExtent$ = createEffect(
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

  public setActiveFilters$ = createEffect(
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

          const center: PointWithSrs = {type: 'Point', srs: this.configService.mapConfig.defaultMapConfig.srsId, coordinates: [x, y]};
          this.mapService.zoomToPoint(center, scale);
        },
      ),
      map(({baseConfig}) => MapConfigActions.setBasemap({activeBasemapId: baseConfig.basemap})),
    );
  });

  public addInitialMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addInitialMapItems),
      concatLatestFrom(() => [this.store.select(selectIsMapServiceInitialized)]),
      map(([{initialMapItems}, isMapServiceInitialized]) => {
        if (isMapServiceInitialized) {
          // only add the map items to the map if the map service is initialized;
          // otherwise this happens automatically during initialization
          initialMapItems.forEach((initialMapItem, index) => {
            initialMapItem.addToMap(this.mapService, index);
          });
        }
        return MapConfigActions.clearInitialMapsConfig();
      }),
    );
  });

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly gb3TopicsService: Gb3TopicsService,
    private readonly store: Store,
    private readonly configService: ConfigService,
  ) {}
}
