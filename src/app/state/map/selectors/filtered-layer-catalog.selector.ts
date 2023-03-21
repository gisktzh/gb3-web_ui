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
        const filteredMaps = item.maps
          .map((map) => {
            // only take layers which match the filter
            map.layers = map.layers.filter((layer) => layer.title.toLowerCase().includes(lowerCasedFilterString));

            return map;
          })
          .filter((map) => {
            // Return true if the map title or one of its sublayers itself includes the filterstring
            return map.layers.length > 0 || map.title.toLowerCase().includes(lowerCasedFilterString);
          });

        return {title: item.title, maps: filteredMaps};
      })
      // only return those topics that contain at least one map
      .filter((item) => item.maps.length > 0)
  );
});
