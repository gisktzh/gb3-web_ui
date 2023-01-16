import {createFeature, createReducer, on} from '@ngrx/store';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {ActiveMapItem} from '../../../../map/models/active-map-item.model';

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
    on(ActiveMapItemActions.addActiveMapItem, (state, activeMapItem): ActiveMapItemState => {
      const otherActiveMapItems = state.activeMapItems.filter((mapItem) => mapItem.id !== activeMapItem.id);
      return {...state, activeMapItems: [...otherActiveMapItems, activeMapItem]};
    }),
    on(ActiveMapItemActions.removeActiveMapItem, (state, activeMapItem): ActiveMapItemState => {
      const remainingActiveMapItems = state.activeMapItems.filter((mapItem) => mapItem.id !== activeMapItem.id);
      return {...state, activeMapItems: [...remainingActiveMapItems]};
    }),
    on(ActiveMapItemActions.removeAllActiveMapItems, (state): ActiveMapItemState => {
      return {...state, activeMapItems: []};
    })
  )
});

export const {name, reducer, selectActiveMapItemState, selectActiveMapItems} = activeMapItemFeature;
