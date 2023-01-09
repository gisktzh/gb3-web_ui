import {createSelector} from '@ngrx/store';
import {selectActiveTopics} from '../reducers/active-topics.reducer';
import {QueryLayer} from '../../../../shared/interfaces/query-layer.interface';

export const selectQueryLayers = createSelector(selectActiveTopics, (activeTopics) => {
  const queryLayers: QueryLayer[] = [];

  activeTopics.map(({topic}) => {
    const layersToQuery = topic.layers.filter((layer) => layer.queryable).map((layer) => layer.layer);
    const queryLayer: QueryLayer = {
      topic: topic.topic,
      layersToQuery: layersToQuery.join(',')
    };

    queryLayers.push(queryLayer);
  });

  return queryLayers;
});
