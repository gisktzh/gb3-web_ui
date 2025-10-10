import {createSelector} from '@ngrx/store';
import {selectFilterString, selectItems} from '../reducers/layer-catalog.reducer';
import {produce} from 'immer';

export const selectFilteredLayerCatalog = createSelector(selectFilterString, selectItems, (filterString, layerCatalog) => {
  const lowerCasedFilterString = filterString?.toLowerCase();
  if (lowerCasedFilterString === '' || lowerCasedFilterString === undefined) {
    return layerCatalog;
  }

  return produce(layerCatalog, (draft) => {
    draft.forEach((item) => {
      // If the filter term is included in the category title, we want all maps of that category.
      // We, therefore, skip filtering out non-matching maps entirely, hence, early return.
      if (item.title.toLowerCase().includes(lowerCasedFilterString)) {
        return;
      }

      item.maps = item.maps.filter((map) => {
        return (
          map.layers.some((layer) => layer.title.toLowerCase().includes(lowerCasedFilterString)) ||
          map.title.toLowerCase().includes(lowerCasedFilterString) ||
          map.keywords.map((keyword) => keyword.toLowerCase()).includes(lowerCasedFilterString) ||
          map.id.toLowerCase().includes(lowerCasedFilterString)
        );
      });
    });
  })
    .filter((item) => item.maps.length > 0)
    .map((item) => ({title: item.title, maps: item.maps}));
});
