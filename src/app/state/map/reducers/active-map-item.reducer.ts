import {createFeature, createReducer, on} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';

export const activeMapItemFeatureKey = 'activeMapItem';

export interface ActiveMapItemState {
  activeMapItems: ActiveMapItem[];
}

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
    on(ActiveMapItemActions.setVisibility, (state, {visible, activeMapItem}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === activeMapItem.id) {
          const newActiveMapItem = structuredClone(mapItem);
          newActiveMapItem.visible = visible;
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
    on(ActiveMapItemActions.setSublayerVisibility, (state, {visible, activeMapItem, layerId}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === activeMapItem.id) {
          const newActiveMapItem = structuredClone(mapItem);
          const sublayer = newActiveMapItem.layers.find((l) => l.id === layerId);
          if (sublayer) {
            sublayer.visible = visible;
          }
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
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
    on(ActiveMapItemActions.setTimeSliderExtent, (state, {timeExtent, activeMapItem}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === activeMapItem.id) {
          const newActiveMapItem = structuredClone(mapItem);
          newActiveMapItem.timeSliderExtent = timeExtent;
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    }),
    on(ActiveMapItemActions.setAttributeFilters, (state, {attributeFilters: attributeFilters, activeMapItem}): ActiveMapItemState => {
      const activeMapItems = state.activeMapItems.map((mapItem) => {
        if (mapItem.id === activeMapItem.id) {
          const newActiveMapItem = structuredClone(mapItem);
          newActiveMapItem.attributeFilters = attributeFilters;
          return newActiveMapItem;
        }
        return mapItem;
      });
      return {...state, activeMapItems: [...activeMapItems]};
    })
  )
});

export const {name, reducer, selectActiveMapItemState, selectActiveMapItems} = activeMapItemFeature;
