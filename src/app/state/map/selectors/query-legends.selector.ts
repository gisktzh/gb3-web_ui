import {createSelector} from '@ngrx/store';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {QueryLegend} from '../../../shared/interfaces/query-legend.interface';
import {selectItems} from '../reducers/active-map-item.reducer';

export const selectQueryLegends = createSelector(selectItems, (activeMapItems) => {
  const queryLegends: QueryLegend[] = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).map((mapItem) => {
    const singleLayer: string | undefined = mapItem.isSingleLayer ? mapItem.settings.layers[0].layer : undefined;
    return {topic: mapItem.settings.mapId, layer: singleLayer};
  });
  return queryLegends;
});
