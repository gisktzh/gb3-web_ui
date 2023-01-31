import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLegend} from '../../../shared/interfaces/query-legend.interface';

export const selectQueryLegends = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLegends: QueryLegend[] = activeMapItems.map((mapItem) => {
    const singleLayer: string | undefined = mapItem.isSingleLayer ? mapItem.layers[0].layer : undefined;
    return {topic: mapItem.mapId, layer: singleLayer};
  });
  return queryLegends;
});
