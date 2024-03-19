import {createSelector} from '@ngrx/store';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {selectNonTemporaryActiveMapItems} from './active-map-items.selector';

// note: we only use non-temporary active map items for the search index because temporary active map items are not searchable
export const selectAvailableSpecialSearchIndexes = createSelector(selectNonTemporaryActiveMapItems, (activeMapItems): SearchIndex[] => {
  const availableIndexes: SearchIndex[] = [];
  activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).forEach((mapItem) => {
    mapItem.settings.searchConfigurations?.forEach((searchConfig) => {
      const notInOutputYet = !availableIndexes.map((index) => index.indexName).includes(searchConfig.index);
      if (notInOutputYet) {
        availableIndexes.push({
          indexName: searchConfig.index,
          label: searchConfig.title,
          active: true,
          indexType: 'activeMapItems',
        });
      }
    });
  });
  return availableIndexes;
});
