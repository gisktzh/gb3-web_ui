import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLayer} from '../../../../shared/interfaces/query-layer.interface';

export const selectQueryLayers = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLayers: QueryLayer[] = [];

  activeMapItems.map((mapItem) => {
    const layersToQuery: string[] = mapItem.layers.filter((layer) => layer.queryable).map((layer) => layer.layer);
    const queryLayer: QueryLayer = {
      topic: mapItem.topic,
      layersToQuery: layersToQuery.join(',')
    };

    queryLayers.push(queryLayer);
  });

  return queryLayers;
});
