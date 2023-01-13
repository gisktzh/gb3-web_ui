import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLayer} from '../../../../shared/interfaces/query-layer.interface';

export const selectQueryLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLayers: QueryLayer[] = [];

  activeMapItems.map((mapItem) => {
    const layersToQuery: string[] = [];
    if (mapItem.layer) {
      if (mapItem.layer.queryable) {
        layersToQuery.push(mapItem.layer.layer);
      }
    } else {
      mapItem.topic.layers.filter((layer) => layer.queryable).forEach((layer) => layersToQuery.push(layer.layer));
    }
    const queryLayer: QueryLayer = {
      topic: mapItem.topic.topic,
      layersToQuery: layersToQuery.join(',')
    };

    queryLayers.push(queryLayer);
  });

  return queryLayers;
});
