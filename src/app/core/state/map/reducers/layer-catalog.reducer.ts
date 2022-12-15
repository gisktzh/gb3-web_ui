import {createFeature, createReducer, on} from '@ngrx/store';
import {LayerCatalogItem} from '../../../../shared/models/gb3-api.interfaces';
import {LayerCatalogActions} from '../actions/layer-catalog.actions';

export const layerCatalogFeatureKey = 'layerCatalog';

export interface LayerCatalogState {
  layerCatalogItems: LayerCatalogItem[];
}

export const initialState: LayerCatalogState = {
  layerCatalogItems: []
};

export const layerCatalogFeature = createFeature({
  name: layerCatalogFeatureKey,
  reducer: createReducer(
    initialState,
    on(LayerCatalogActions.setLayerCatalog, (state, {layerCatalogItems}): LayerCatalogState => {
      return {...state, layerCatalogItems: layerCatalogItems};
    }),
    on(LayerCatalogActions.addLayerCatalogItem, (state, {layerCatalogItem}): LayerCatalogState => {
      return {...state, layerCatalogItems: [...state.layerCatalogItems, layerCatalogItem]};
    }),
    on(LayerCatalogActions.clearLayerCatalog, (state): LayerCatalogState => {
      return {...state, layerCatalogItems: []};
    })
  )
});

export const {name, reducer, selectLayerCatalogItems} = layerCatalogFeature;
