import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLegend} from '../../../shared/interfaces/query-legend.interface';
import {Gb2WmsActiveMapItem} from '../../../map/models/active-map-item.model';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

export const selectQueryLegends = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLegends: QueryLegend[] = activeMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).map((mapItem) => {
    const singleLayer: string | undefined = mapItem.isSingleLayer ? mapItem.configuration.layers[0].layer : undefined;
    return {topic: mapItem.configuration.mapId, layer: singleLayer};
  });
  return queryLegends;
});
