import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {ACTIVE_SEARCH_INDICES} from '../../../shared/constants/search.constants';
import {ActiveMapItem, Gb2WmsMapItemConfiguration} from '../../../map/models/active-map-item.model';

export const selectAvailableSpecialSearchIndexes = createSelector(selectActiveMapItems, (activeMapItems) => {
  const availableIndexes: SearchIndex[] = [];

  activeMapItems
    .filter((m) => m.configuration.type === 'gb2Wms')
    .map((m) => m as ActiveMapItem<Gb2WmsMapItemConfiguration>) // todo: remove
    .forEach((mapItem) => {
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
