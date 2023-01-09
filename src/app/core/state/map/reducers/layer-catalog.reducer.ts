import {createFeature, createReducer, on} from '@ngrx/store';
import {LayerCatalogItem} from '../../../../shared/models/gb3-api.interfaces';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';
import {HasLoadingState} from '../../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../../shared/enums/loading-state';

export const layerCatalogFeatureKey = 'layerCatalog';

export interface LayerCatalogState extends HasLoadingState {
  layerCatalogItems: LayerCatalogItem[];
}

export const initialState: LayerCatalogState = {
  layerCatalogItems: [],
  loadingState: LoadingState.UNDEFINED
};

export const layerCatalogFeature = createFeature({
  name: layerCatalogFeatureKey,
  reducer: createReducer(
    initialState,
    on(LayerCatalogActions.loadLayerCatalog, (): LayerCatalogState => {
      return {...initialState, loadingState: LoadingState.LOADING};
    }),
    on(LayerCatalogActions.setLayerCatalog, (state, {layerCatalogItems}): LayerCatalogState => {
      return {...state, layerCatalogItems: layerCatalogItems, loadingState: LoadingState.LOADED};
    }),
    on(LayerCatalogActions.addLayerCatalogItem, (state, {layerCatalogItem}): LayerCatalogState => {
      return {...state, layerCatalogItems: [...state.layerCatalogItems, layerCatalogItem]};
    }),
    on(LayerCatalogActions.clearLayerCatalog, (state): LayerCatalogState => {
      return {...state, layerCatalogItems: []};
    })
  )
});

export const {name, reducer, selectLayerCatalogItems, selectLoadingState} = layerCatalogFeature;
