import {createSelector} from '@ngrx/store';
import {selectTerm} from '../reducers/search.reducer';
import {selectMaps} from '../../map/selectors/maps.selector';
import {Map} from '../../../shared/interfaces/topic.interface';

export const selectFilteredLayerCatalogMaps = createSelector(selectTerm, selectMaps, (filterString, maps): Map[] => {
  const lowerCasedFilterString = filterString.toLowerCase();
  if (lowerCasedFilterString === '') {
    return maps;
  }

  return maps.filter((map) => {
    // Return true if the map title OR one of the keywords includes the filter string
    return (
      map.title.toLowerCase().includes(lowerCasedFilterString) ||
      map.keywords.map((keyword) => keyword.toLowerCase()).includes(lowerCasedFilterString)
    );
  });
});
