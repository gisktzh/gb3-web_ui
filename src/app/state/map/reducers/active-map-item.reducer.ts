import {createFeature, createReducer, on} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItemState} from '../states/active-map-item.state';
import {produce} from 'immer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {ActiveTimeSliderLayersUtils} from '../../../map/utils/active-time-slider-layers.utils';

export const activeMapItemFeatureKey = 'activeMapItem';

export const initialState: ActiveMapItemState = {
  items: [],
};

export const activeMapItemFeature = createFeature({
  name: activeMapItemFeatureKey,
  reducer: createReducer(
    initialState,
    on(
      ActiveMapItemActions.addActiveMapItem,
      produce((draft, {activeMapItem, position}) => {
        const existing = draft.items.find((mapItem) => mapItem.id === activeMapItem.id);
        if (existing) {
          if (!existing.isTemporary) {
            // the map item is already active - no state changes necessary
            return draft;
          } else {
            // the map item is existing as a temporary (i.e. hovered) item, so we convert it to a non-temporary one
            existing.isTemporary = false;
            return draft;
          }
        }

        draft.items.splice(position, 0, activeMapItem);
        return draft;
      }),
    ),
    on(ActiveMapItemActions.removeAllTemporaryActiveMapItems, (state): ActiveMapItemState => {
      const remainingActiveMapItems = state.items.filter((mapItem) => !mapItem.isTemporary);
      return {...state, items: [...remainingActiveMapItems]};
    }),
    on(ActiveMapItemActions.removeActiveMapItem, (state, {activeMapItem}): ActiveMapItemState => {
      const remainingActiveMapItems = state.items.filter((mapItem) => mapItem.id !== activeMapItem.id);
      return {...state, items: [...remainingActiveMapItems]};
    }),
    on(ActiveMapItemActions.removeAllActiveMapItems, (state): ActiveMapItemState => {
      return {...state, items: []};
    }),
    on(
      ActiveMapItemActions.moveToTop,
      produce((draft, {activeMapItem}) => {
        const index = draft.items.findIndex((item) => item.id === activeMapItem.id);
        if (index > 0) {
          const entry = draft.items.splice(index, 1);
          draft.items.unshift(...entry);
        }
      }),
    ),
    on(
      ActiveMapItemActions.forceFullVisibility,
      produce((draft, {activeMapItem}) => {
        draft.items.forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.opacity = 1.0;
            mapItem.visible = true;
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setOpacity,
      produce((draft, {opacity, activeMapItem}) => {
        draft.items.forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.opacity = opacity;
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setVisibility,
      produce((draft, {visible, activeMapItem}) => {
        draft.items.forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.visible = visible;
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setSublayerVisibility,
      produce((draft, {visible, activeMapItem, layerId}) => {
        draft.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const sublayer = mapItem.settings.layers.find((l) => l.id === layerId);
            if (sublayer) {
              sublayer.visible = visible;
            }
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setLoadingState,
      produce((draft, {loadingState, id}) => {
        draft.items.forEach((mapItem) => {
          if (mapItem.id === id) {
            mapItem.loadingState = loadingState;
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setViewProcessState,
      produce((draft, {viewProcessState, id}) => {
        draft.items.forEach((mapItem) => {
          if (mapItem.id === id) {
            mapItem.viewProcessState = viewProcessState;
          }
        });
      }),
    ),
    on(ActiveMapItemActions.reorderActiveMapItem, (state, {previousPosition, currentPosition}): ActiveMapItemState => {
      const mapItemToReorder = state.items[previousPosition];
      const reorderedActiveMapItems = state.items.filter((mapItem) => mapItem !== mapItemToReorder);
      reorderedActiveMapItems.splice(currentPosition, 0, mapItemToReorder);
      return {...state, items: [...reorderedActiveMapItems]};
    }),
    on(
      ActiveMapItemActions.reorderSublayer,
      produce((draft, {activeMapItem, previousPosition, currentPosition}) => {
        draft.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const sublayerToReorder = mapItem.settings.layers.splice(previousPosition, 1);
            mapItem.settings.layers.splice(currentPosition, 0, ...sublayerToReorder);
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setTimeSliderExtent,
      produce((draft, {timeExtent, activeMapItem}) => {
        draft.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.settings.timeSliderExtent = timeExtent;
            mapItem.settings.layers.forEach((layer) => {
              const isVisible = ActiveTimeSliderLayersUtils.isLayerVisible(
                layer,
                mapItem.settings.timeSliderConfiguration,
                mapItem.settings.timeSliderExtent,
              );
              if (isVisible !== undefined) {
                layer.visible = isVisible;
              }
            });
          }
        });
      }),
    ),
    on(
      ActiveMapItemActions.setAttributeFilterValueState,
      produce((draft, {isFilterValueActive, filterValueName, attributeFilterParameter, activeMapItem}) => {
        draft.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const filterValue = mapItem.settings.filterConfigurations
              ?.find((filterConfig) => filterConfig.parameter === attributeFilterParameter)
              ?.filterValues.find((fv) => fv.name === filterValueName);
            if (filterValue) {
              filterValue.isActive = isFilterValueActive;
            }
          }
        });
      }),
    ),
    on(ActiveMapItemActions.addFavourite, (state, {activeMapItems}): ActiveMapItemState => {
      const favouriteIds = activeMapItems.map((activeMapItem) => activeMapItem.id);
      const activeMapItemsToStay = state.items.filter((activeMapItem) => !favouriteIds.includes(activeMapItem.id));

      return {...state, items: [...activeMapItems, ...activeMapItemsToStay]};
    }),
    on(ActiveMapItemActions.addInitialMapItems, (state, {initialMapItems}): ActiveMapItemState => {
      const initialMapItemIds = initialMapItems.map((initialMapItem) => initialMapItem.id);
      const activeMapItemsToStay = state.items.filter((activeMapItem) => !initialMapItemIds.includes(activeMapItem.id));

      return {...state, items: [...initialMapItems, ...activeMapItemsToStay]};
    }),
    on(
      ActiveMapItemActions.markAllActiveMapItemNoticeAsRead,
      produce((draft) => {
        draft.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          mapItem.settings.isNoticeMarkedAsRead = true;
        });
      }),
    ),
  ),
});

// we're explicitly not exposing `selectItems` because there is a selector doing that already filtering all temporary items by default
export const {name, reducer, selectActiveMapItemState} = activeMapItemFeature;
