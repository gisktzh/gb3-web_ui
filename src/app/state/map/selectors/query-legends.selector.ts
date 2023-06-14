import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLegend} from '../../../shared/interfaces/query-legend.interface';
import {ActiveMapItem, Gb2WmsMapItemConfiguration} from '../../../map/models/active-map-item.model';

export const selectQueryLegends = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLegends: QueryLegend[] = activeMapItems
    .filter((mapItem) => mapItem.configuration.type === 'gb2Wms') // todo: remove
    .map((m) => m as ActiveMapItem<Gb2WmsMapItemConfiguration>)
    .map((mapItem) => {
      const singleLayer: string | undefined = mapItem.isSingleLayer ? mapItem.configuration.layers[0].layer : undefined;
      return {topic: mapItem.configuration.mapId, layer: singleLayer};
    });
  return queryLegends;
});
