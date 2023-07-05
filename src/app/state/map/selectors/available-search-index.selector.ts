import {createSelector} from '@ngrx/store';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {ACTIVE_SEARCH_INDICES} from '../../../shared/constants/search.constants';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {selectItems} from '../reducers/active-map-item.reducer';

export const selectAvailableSpecialSearchIndexes = createSelector(selectItems, (activeMapItems) => {
  const availableIndexes: SearchIndex[] = [];

  activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
    mapItem.settings.searchConfigurations?.forEach((searchConfig) => {
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
