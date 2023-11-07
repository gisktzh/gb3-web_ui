import {createSelector} from '@ngrx/store';
import {Gb2WmsActiveMapItem} from 'src/app/map/models/implementations/gb2-wms.model';
import {isActiveMapItemOfType} from 'src/app/shared/type-guards/active-map-item-type.type-guard';
import {selectItems} from '../reducers/active-map-item.reducer';
import {selectId} from '../reducers/map-attribute-filters-item.reducer';

export const selectMapAttributeFiltersItem = createSelector(selectId, selectItems, (id, activeMapItems) => {
  return activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).find((activeMapItem) => activeMapItem.id == id);
});
