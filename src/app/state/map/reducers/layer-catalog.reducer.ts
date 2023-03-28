import {createFeature, createReducer, on} from '@ngrx/store';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {Topic} from '../../../shared/interfaces/topic.interface';

export const layerCatalogFeatureKey = 'layerCatalog';

export interface LayerCatalogState extends HasLoadingState {
  layerCatalogItems: Topic[];
  filterString: string;
}

export const initialState: LayerCatalogState = {
  layerCatalogItems: [],
  loadingState: 'undefined',
  filterString: ''
};

export const layerCatalogFeature = createFeature({
  name: layerCatalogFeatureKey,
  reducer: createReducer(
    initialState,
    on(LayerCatalogActions.loadLayerCatalog, (): LayerCatalogState => {
      return {...initialState, loadingState: 'loading'};
    }),
    on(LayerCatalogActions.setLayerCatalog, (state, {layerCatalogItems}): LayerCatalogState => {
      return {...state, layerCatalogItems: layerCatalogItems, loadingState: 'loaded'};
    }),
    on(LayerCatalogActions.addLayerCatalogItem, (state, {layerCatalogItem}): LayerCatalogState => {
      return {...state, layerCatalogItems: [...state.layerCatalogItems, layerCatalogItem]};
    }),
    on(LayerCatalogActions.clearLayerCatalog, (state): LayerCatalogState => {
      return {...state, layerCatalogItems: []};
    }),
    on(LayerCatalogActions.setFilterString, (state, {filterString}): LayerCatalogState => {
      return {...state, filterString};
    })
  )
});

export const {name, reducer, selectFilterString, selectLayerCatalogItems, selectLoadingState} = layerCatalogFeature;
