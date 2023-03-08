import {createSelector} from '@ngrx/store';
import {selectLayerCatalogItems} from '../reducers/layer-catalog.reducer';

export const selectAvailableMaps = createSelector(selectLayerCatalogItems, (layerCatalogItems) => {
  return layerCatalogItems.map((item) => item.maps).flat();
});
