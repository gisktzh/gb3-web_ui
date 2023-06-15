import {createFeature, createReducer, on} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {ActiveMapItemState} from '../states/active-map-item.state';
import {produce} from 'immer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';

export const activeMapItemFeatureKey = 'activeMapItem';

export const initialState: ActiveMapItemState = {
  activeMapItems: []
};

export const activeMapItemFeature = createFeature({
  name: activeMapItemFeatureKey,
  reducer: createReducer(
    initialState,
    on(ActiveMapItemActions.addActiveMapItem, (state, {activeMapItem, position}): ActiveMapItemState => {
      if (state.activeMapItems.some((mapItem) => mapItem.id === activeMapItem.id)) {
        // the map item is already active - no state changes necessary
        return {...state};
      }
      const newActiveMapItems: ActiveMapItem[] = [...state.activeMapItems];
      newActiveMapItems.splice(position, 0, activeMapItem);
      return {...state, activeMapItems: newActiveMapItems};
    }),
    on(ActiveMapItemActions.removeActiveMapItem, (state, activeMapItem): ActiveMapItemState => {
      const remainingActiveMapItems = state.activeMapItems.filter((mapItem) => mapItem.id !== activeMapItem.id);
      return {...state, activeMapItems: [...remainingActiveMapItems]};
    }),
    on(ActiveMapItemActions.removeAllActiveMapItems, (state): ActiveMapItemState => {
      return {...state, activeMapItems: []};
    }),
    on(
      ActiveMapItemActions.setOpacity,
      produce((draft, {opacity, activeMapItem}) => {
        draft.activeMapItems.forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.opacity = opacity;
          }
        });
      })
    ),
    on(
      ActiveMapItemActions.setVisibility,
      produce((draft, {visible, activeMapItem}) => {
        draft.activeMapItems.forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.visible = visible;
          }
        });
      })
    ),
    on(
      ActiveMapItemActions.setSublayerVisibility,
      produce((draft, {visible, activeMapItem, layerId}) => {
        draft.activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const sublayer = mapItem.configuration.layers.find((l) => l.id === layerId);
            if (sublayer) {
              sublayer.visible = visible;
            }
          }
        });
      })
    ),
    on(
      ActiveMapItemActions.setLoadingState,
      produce((draft, {loadingState, id}) => {
        draft.activeMapItems.forEach((mapItem) => {
          if (mapItem.id === id) {
            mapItem.loadingState = loadingState;
          }
        });
      })
    ),
    on(
      ActiveMapItemActions.setViewProcessState,
      produce((draft, {viewProcessState, id}) => {
        draft.activeMapItems.forEach((mapItem) => {
          if (mapItem.id === id) {
            mapItem.viewProcessState = viewProcessState;
          }
        });
      })
    ),
    on(ActiveMapItemActions.reorderActiveMapItem, (state, {previousPosition, currentPosition}): ActiveMapItemState => {
      const mapItemToReorder = state.activeMapItems[previousPosition];
      const reorderedActiveMapItems = state.activeMapItems.filter((mapItem) => mapItem !== mapItemToReorder);
      reorderedActiveMapItems.splice(currentPosition, 0, mapItemToReorder);
      return {...state, activeMapItems: [...reorderedActiveMapItems]};
    }),
    on(
      ActiveMapItemActions.reorderSublayer,
      produce((draft, {activeMapItem, previousPosition, currentPosition}) => {
        draft.activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const sublayerToReorder = mapItem.configuration.layers.splice(previousPosition, 1);
            mapItem.configuration.layers.splice(currentPosition, 0, ...sublayerToReorder);
          }
        });
      })
    ),
    on(
      ActiveMapItemActions.setTimeSliderExtent,
      produce((draft, {timeExtent, activeMapItem}) => {
        draft.activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.configuration.timeSliderExtent = timeExtent;
          }
        });
      })
    ),
    on(
      ActiveMapItemActions.setAttributeFilterValueState,
      produce((draft, {isFilterValueActive, filterValueName, attributeFilterParameter, activeMapItem}) => {
        draft.activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const filterValue = mapItem.configuration.filterConfigurations
              ?.find((filterConfig) => filterConfig.parameter === attributeFilterParameter)
              ?.filterValues.find((fv) => fv.name === filterValueName);
            if (filterValue) {
              filterValue.isActive = isFilterValueActive;
            }
          }
        });
      })
    ),
    on(ActiveMapItemActions.addFavourite, (state, {favourite}): ActiveMapItemState => {
      const favouriteIds = favourite.map((fav) => fav.id);
      const activeMapItemsToStay = state.activeMapItems.filter((activeMapItem) => !favouriteIds.includes(activeMapItem.id));

      return {...state, activeMapItems: [...favourite, ...activeMapItemsToStay]};
    }),
    on(ActiveMapItemActions.addInitialMapItems, (state, {initialMapItems}): ActiveMapItemState => {
      const initialMapItemIds = initialMapItems.map((initialMapItem) => initialMapItem.id);
      const activeMapItemsToStay = state.activeMapItems.filter((activeMapItem) => !initialMapItemIds.includes(activeMapItem.id));

      return {...state, activeMapItems: [...initialMapItems, ...activeMapItemsToStay]};
    }),
    on(
      ActiveMapItemActions.markAllActiveMapItemNoticeAsRead,
      produce((draft) => {
        draft.activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
          mapItem.configuration.isNoticeMarkedAsRead = true;
        });
      })
    )
  )
});

export const {name, reducer, selectActiveMapItemState, selectActiveMapItems} = activeMapItemFeature;
