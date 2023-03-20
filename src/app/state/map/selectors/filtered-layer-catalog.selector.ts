import {createSelector} from '@ngrx/store';
import {selectFilterString, selectLayerCatalogItems} from '../reducers/layer-catalog.reducer';

export const selectFilteredLayerCatalog = createSelector(selectFilterString, selectLayerCatalogItems, (filterString, layerCatalog) => {
  const lowerCasedFilterString = filterString.toLowerCase();
  const re = new RegExp(lowerCasedFilterString, 'ig');
  if (lowerCasedFilterString === '') {
    return layerCatalog;
  }

  const clonedLayerCatalog = structuredClone(layerCatalog);

  return clonedLayerCatalog
    .map((item) => {
      const filteredMaps = item.maps.filter((map) => {
        // check for sublayers
        map.layers = map.layers.filter((layer) => {
          if (layer.title.toLowerCase().includes(lowerCasedFilterString)) {
            layer.title = layer.title.replace(re, '<b>$&</b>');
            return true;
          }

          return false;
        });

        // else only return if the map itself contains the search

        if (map.title.toLowerCase().includes(lowerCasedFilterString)) {
          map.title = map.title.replace(re, '<b>$&</b>');
          return true;
        } else if (map.layers.length > 0) {
          return true;
        }

        return false;
      });
      return {title: item.title, maps: filteredMaps};
    })
    .filter((item) => item.maps.length > 0);
});
