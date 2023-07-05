import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/layer-catalog.reducer';

export const selectAvailableMaps = createSelector(selectItems, (layerCatalogItems) => {
  return layerCatalogItems.map((item) => item.maps).flat();
});
