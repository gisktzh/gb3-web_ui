import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from "../reducers/active-map-item.reducer";
import {SearchIndex} from "../../../shared/services/apis/search/interfaces/search-index.interface";
import {ACTIVE_SEARCH_INDICES} from "../../../shared/constants/search.constants";

export const selectAvailableSpecialSearchIndexes = createSelector(selectActiveMapItems, (activeMapItems) => {
  const availableIndexes: SearchIndex[] = [];

  activeMapItems.forEach((mapItem) => {
    mapItem.searchConfigurations?.forEach((searchConfig) => {
      const alreadyInElasticsearch = ACTIVE_SEARCH_INDICES.includes(searchConfig.index.toLowerCase());
      const notInOutputYet = !availableIndexes.map(index => index.indexName).includes(searchConfig.index);
      if (alreadyInElasticsearch && notInOutputYet) {
        availableIndexes.push({
          indexName: searchConfig.index,
          displayString: searchConfig.title,
          active: true,
          indexType: 'special'
        });
      }
    });
  });
  return availableIndexes;
});
