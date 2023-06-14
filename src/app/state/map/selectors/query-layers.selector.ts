import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLayer} from '../../../shared/interfaces/query-layer.interface';
import {ActiveMapItem, Gb2WmsMapItemConfiguration} from '../../../map/models/active-map-item.model';

export const selectQueryLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLayers: QueryLayer[] = [];

  activeMapItems
    .filter((m) => m.configuration.type === 'gb2Wms') // todo: remove
    .map((m) => m as ActiveMapItem<Gb2WmsMapItemConfiguration>)
    .map((mapItem) => {
      const layersToQuery: string[] = mapItem.configuration.layers.filter((layer) => layer.queryable).map((layer) => layer.layer);
      const queryLayer: QueryLayer = {
        topic: mapItem.configuration.mapId,
        layersToQuery: layersToQuery.join(',')
      };

      queryLayers.push(queryLayer);
    });

  return queryLayers;
});
