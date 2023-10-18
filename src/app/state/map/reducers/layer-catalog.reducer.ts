import {createFeature, createReducer, on} from '@ngrx/store';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {LayerCatalogState} from '../states/layer-catalog.state';

export const layerCatalogFeatureKey = 'layerCatalog';

export const initialState: LayerCatalogState = {
  items: [],
  loadingState: undefined,
  filterString: '',
  isSearching: false,
};

export const layerCatalogFeature = createFeature({
  name: layerCatalogFeatureKey,
  reducer: createReducer(
    initialState,
    on(LayerCatalogActions.loadLayerCatalog, (state): LayerCatalogState => {
      // If we already have items, we do not reset the state
      if (state.items.length > 0) {
        return state;
      }

      return {...initialState, loadingState: 'loading'};
    }),
    on(LayerCatalogActions.setLayerCatalog, (state, {items}): LayerCatalogState => {
      return {...state, items, loadingState: 'loaded'};
    }),
    on(LayerCatalogActions.addLayerCatalogItem, (state, {item}): LayerCatalogState => {
      return {...state, items: [...state.items, item]};
    }),
    on(LayerCatalogActions.clearLayerCatalog, (state): LayerCatalogState => {
      return {...state, items: []};
    }),
    on(LayerCatalogActions.setFilterString, (state, {filterString}): LayerCatalogState => {
      return {...state, filterString};
    }),
    on(LayerCatalogActions.toggleIsSearching, (state, {isSearching}): LayerCatalogState => {
      return {...state, isSearching};
    }),
  ),
});

export const {name, reducer, selectLayerCatalogState, selectFilterString, selectItems, selectLoadingState, selectIsSearching} =
  layerCatalogFeature;
