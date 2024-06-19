import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {concatLatestFrom} from '@ngrx/operators';
import {Store} from '@ngrx/store';
import {filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {ConfigService} from '../../../shared/services/config.service';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {ToolType} from '../../../shared/types/tool.type';
import {selectScreenMode} from '../../app/reducers/app-layout.reducer';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {FeatureInfoActions} from '../actions/feature-info.actions';
import {MapConfigActions} from '../actions/map-config.actions';
import {MapUiActions} from '../actions/map-ui.actions';
import {ToolActions} from '../actions/tool.actions';
import {selectItems, selectTemporaryMapItems} from '../selectors/active-map-items.selector';
import {selectIsMapServiceInitialized} from '../reducers/map-config.reducer';
import {selectActiveTool} from '../reducers/tool.reducer';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {DrawingActions} from '../actions/drawing.actions';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {SearchActions} from '../../app/actions/search.actions';

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

  public removeAllTemporaryMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        LayerCatalogActions.setFilterString,
        LayerCatalogActions.clearFilterString,
        SearchActions.searchForTerm,
        SearchActions.clearSearchTerm,
      ),
      concatLatestFrom(() => this.store.select(selectTemporaryMapItems)),
      map(([, activeMapItems]) => {
        activeMapItems.forEach((activeMapItem) => {
          this.mapService.removeMapItem(activeMapItem.id);
        });
        return ActiveMapItemActions.removeAllTemporaryActiveMapItems();
      }),
    );
  });

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

  public removeTemporaryActiveMapItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeTemporaryActiveMapItem),
      concatLatestFrom(() => this.store.select(selectItems)),
      filter(([{activeMapItem}, nonTemporaryActiveMapItems]) => {
        // we only remove the temporary item if it is not converted to a non-temporary in the meantime, i.e.
        return !nonTemporaryActiveMapItems.some((nonTemporaryActiveMapItem) => nonTemporaryActiveMapItem.id === activeMapItem.id);
      }),
      map(([{activeMapItem}, _]) => ActiveMapItemActions.removeActiveMapItem({activeMapItem})),
    );
  });

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
        const definedActiveTool: ToolType = activeTool;
        let activeUserDrawingLayer: UserDrawingLayer;
        switch (action.type) {
          case '[ActiveMapItem] Remove Active Map Item':
            switch (definedActiveTool) {
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
              case 'draw-text':
                activeUserDrawingLayer = UserDrawingLayer.Drawings;
                break;
              case 'select-circle':
              case 'select-polygon':
              case 'select-rectangle':
              case 'select-section':
              case 'select-canton':
              case 'select-municipality':
              case 'measure-elevation-profile':
                // these tools are used on an internal layer
                return false;
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
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([_, screenMode]) => screenMode !== 'mobile'),
      map(() => MapUiActions.setLegendOverlayVisibility({isVisible: false})),
    );
  });

  public hideMapAttributeFilterAfterRemovingAllMapItems$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.removeAllActiveMapItems),
      concatLatestFrom(() => this.store.select(selectScreenMode)),
      filter(([_, screenMode]) => screenMode !== 'mobile'),
      map(() => MapUiActions.setAttributeFilterVisibility({isVisible: false})),
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

  public setTimeSliderExtentOnMap$ = createEffect(
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

  public zoomToAddedFavourite$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ActiveMapItemActions.addFavourite),
        tap(
          ({
            baseConfig: {
              scale,
              center: {x, y},
            },
          }) => {
            const center: PointWithSrs = {type: 'Point', srs: this.configService.mapConfig.defaultMapConfig.srsId, coordinates: [x, y]};
            this.mapService.zoomToPoint(center, scale);
          },
        ),
      );
    },
    {dispatch: false},
  );

  public addFavourite$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addFavourite),
      map(({activeMapItems, drawingsToAdd}) => {
        const drawingLayersToOverride: UserDrawingLayer[] = [];
        activeMapItems.forEach((activeMapItem, idx) => {
          this.mapService.removeMapItem(activeMapItem.id);
          activeMapItem.addToMap(this.mapService, idx);

          if (activeMapItem instanceof DrawingActiveMapItem) {
            this.mapService.getToolService().addExistingDrawingsToLayer(
              drawingsToAdd.filter((drawing) => drawing.source === activeMapItem.settings.userDrawingLayer),
              activeMapItem.settings.userDrawingLayer,
            );

            drawingLayersToOverride.push(activeMapItem.settings.userDrawingLayer);
          }
        });

        return DrawingActions.overwriteDrawingLayersWithDrawings({layersToOverride: drawingLayersToOverride, drawingsToAdd});
      }),
    );
  });

  public updateBasemapForFavourite$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ActiveMapItemActions.addFavourite),
      map(({baseConfig}) => {
        return MapConfigActions.setBasemap({activeBasemapId: baseConfig.basemap});
      }),
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
