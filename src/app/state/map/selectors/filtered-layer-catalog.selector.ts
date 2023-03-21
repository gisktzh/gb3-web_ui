import {createSelector} from '@ngrx/store';
import {selectFilterString, selectLayerCatalogItems} from '../reducers/layer-catalog.reducer';

export const selectFilteredLayerCatalog = createSelector(selectFilterString, selectLayerCatalogItems, (filterString, layerCatalog) => {
  const lowerCasedFilterString = filterString.toLowerCase();
  if (lowerCasedFilterString === '') {
    return layerCatalog;
  }

  const filteredLayerCatalog = structuredClone(layerCatalog);

  return (
    filteredLayerCatalog
      .map((item) => {
        const filteredMaps = item.maps.filter((map) => {
          // Filter sublayer to only include those that match the filter
          map.layers = map.layers.filter((layer) => layer.title.toLowerCase().includes(lowerCasedFilterString));

          // Return true if the map title itself includes the filterstring...
          if (map.title.toLowerCase().includes(lowerCasedFilterString)) {
            return true;
          }
          // ... or if the map has sublayers that contain the filterstring ...
          else if (map.layers.length > 0) {
            return true;
          }
          // ... else the map is no match.
          return false;
        });

        return {title: item.title, maps: filteredMaps};
      })
      // only return those topics that contain at least one map
      .filter((item) => item.maps.length > 0)
  );
});
