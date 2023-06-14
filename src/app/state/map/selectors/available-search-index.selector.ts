import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {ACTIVE_SEARCH_INDICES} from '../../../shared/constants/search.constants';
import {Gb2WmsMapItemConfiguration} from '../../../map/models/active-map-item.model';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

export const selectAvailableSpecialSearchIndexes = createSelector(selectActiveMapItems, (activeMapItems) => {
  const availableIndexes: SearchIndex[] = [];

  activeMapItems.filter(isActiveMapItemOfType(Gb2WmsMapItemConfiguration)).forEach((mapItem) => {
    mapItem.configuration.searchConfigurations?.forEach((searchConfig) => {
      const alreadyInElasticsearch = ACTIVE_SEARCH_INDICES.includes(searchConfig.index.toLowerCase());
      const notInOutputYet = !availableIndexes.map((index) => index.indexName).includes(searchConfig.index);
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
