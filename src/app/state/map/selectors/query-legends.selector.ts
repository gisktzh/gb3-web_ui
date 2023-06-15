import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLegend} from '../../../shared/interfaces/query-legend.interface';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';

export const selectQueryLegends = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLegends: QueryLegend[] = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).map((mapItem) => {
    const singleLayer: string | undefined = mapItem.isSingleLayer ? mapItem.configuration.layers[0].layer : undefined;
    return {topic: mapItem.configuration.mapId, layer: singleLayer};
  });
  return queryLegends;
});
