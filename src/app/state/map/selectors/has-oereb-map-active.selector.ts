import {createSelector} from '@ngrx/store';
import {selectItems} from './active-map-items.selector';
import {isActiveMapItemOfType} from 'src/app/shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from 'src/app/map/models/implementations/gb2-wms.model';
import {OerebMapsWithExtract} from 'src/app/shared/configs/oereb-maps.config';

export const selectHasOerebMapActive = createSelector(selectItems, (activeMapItems) => {
  return activeMapItems
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .map((item) => item.settings.mapId)
    .some((activeMapItemId) => OerebMapsWithExtract.includes(activeMapItemId));
});
