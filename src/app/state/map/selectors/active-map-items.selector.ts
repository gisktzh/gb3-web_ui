import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/active-map-item.reducer';

export const selectGb2WmsActiveMapItemsWithMapNotices = createSelector(selectItems, (activeMapItems) => {
  return activeMapItems
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .filter((gb2WmsActiveMapItem) => gb2WmsActiveMapItem.settings.notice);
});

export const selectNonTemporaryActiveMapItems = createSelector(selectItems, (activeMapItems) => {
  return activeMapItems.filter((activeMapItem) => !activeMapItem.isTemporary);
});
