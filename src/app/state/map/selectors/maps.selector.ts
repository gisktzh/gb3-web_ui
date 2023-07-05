import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/layer-catalog.reducer';

export const selectMaps = createSelector(selectItems, (layerCatalog) => {
  return layerCatalog.flatMap((topic) => topic.maps);
});
