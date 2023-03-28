import {createSelector} from '@ngrx/store';
import {selectLayerCatalogItems} from '../reducers/layer-catalog.reducer';

export const selectMaps = createSelector(selectLayerCatalogItems, (layerCatalog) => {
  return layerCatalog.flatMap((topic) => topic.maps);
});
