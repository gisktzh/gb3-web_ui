import {createFeature, createReducer, on} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {ActiveMapItemState} from '../states/active-map-item.state';
import {produce} from 'immer';

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
    on(ActiveMapItemActions.setOpacity, (state, {opacity, activeMapItem}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === activeMapItem.id) {
          const newActiveMapItem = structuredClone(mapItem);
          newActiveMapItem.opacity = opacity;
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
    on(
      ActiveMapItemActions.setVisibility,
      produce((draft, {visible, activeMapItem}) => {
        draft.activeMapItems.map((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.visible = visible;
          }
          return mapItem;
        });
      })
    ),
    on(
      ActiveMapItemActions.setSublayerVisibility,
      produce((draft, {visible, activeMapItem, layerId}) => {
        draft.activeMapItems.map((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const sublayer = mapItem.layers.find((l) => l.id === layerId);
            if (sublayer) {
              sublayer.visible = visible;
            }
            return mapItem;
          }
          return mapItem;
        });
      })
    ),
    on(ActiveMapItemActions.setLoadingState, (state, {loadingState, id}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === id) {
          const newActiveMapItem = structuredClone(mapItem);
          newActiveMapItem.loadingState = loadingState;
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
    on(ActiveMapItemActions.setViewProcessState, (state, {viewProcessState, id}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === id) {
          const newActiveMapItem = structuredClone(mapItem);
          newActiveMapItem.viewProcessState = viewProcessState;
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
    on(ActiveMapItemActions.reorderActiveMapItem, (state, {previousPosition, currentPosition}): ActiveMapItemState => {
      const mapItemToReorder = state.activeMapItems[previousPosition];
      const reorderedActiveMapItems = state.activeMapItems.filter((mapItem) => mapItem !== mapItemToReorder);
      reorderedActiveMapItems.splice(currentPosition, 0, mapItemToReorder);
      return {...state, activeMapItems: [...reorderedActiveMapItems]};
    }),
    on(ActiveMapItemActions.reorderSublayer, (state, {activeMapItem, previousPosition, currentPosition}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === activeMapItem.id) {
          const newActiveMapItem = structuredClone(mapItem);
          const sublayerToReorder = newActiveMapItem.layers.splice(previousPosition, 1);
          newActiveMapItem.layers.splice(currentPosition, 0, ...sublayerToReorder);
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
    on(
      ActiveMapItemActions.setTimeSliderExtent,
      produce((draft, {timeExtent, activeMapItem}) => {
        draft.activeMapItems.map((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            mapItem.timeSliderExtent = timeExtent;
            return mapItem;
          }
          return mapItem;
        });
      })
    ),
    on(
      ActiveMapItemActions.setAttributeFilterValueState,
      produce((draft, {isFilterValueActive, filterValueName, attributeFilterParameter, activeMapItem}) => {
        draft.activeMapItems.map((mapItem) => {
          if (mapItem.id === activeMapItem.id) {
            const filterValue = mapItem.filterConfigurations
              ?.find((filterConfig) => filterConfig.parameter === attributeFilterParameter)
              ?.filterValues.find((fv) => fv.name === filterValueName);
            if (filterValue) {
              filterValue.isActive = isFilterValueActive;
            }
          }
          return mapItem;
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
    })
  )
});

export const {name, reducer, selectActiveMapItemState, selectActiveMapItems} = activeMapItemFeature;
