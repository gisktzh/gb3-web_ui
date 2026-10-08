import {createSelector} from '@ngrx/store';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {statisticsMapQueries} from '../../../shared/configs/statistics.config';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {selectItems} from './active-map-items.selector';

export const selectIsStatisticsAvailable = createSelector(selectItems, (items) =>
  items
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .some((item) =>
      (statisticsMapQueries[item.settings.mapId] ?? []).some((query) => item.settings.layers.some((layer) => layer.layer === query.layer)),
    ),
);
