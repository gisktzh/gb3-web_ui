import {createSelector} from '@ngrx/store';
import {findVisibleMapLayers} from '../../../map/utils/visible-map-layers.utils';
import {statisticsMapQueries} from '../../../shared/configs/statistics.config';
import {StatisticsQuery} from '../../../shared/interfaces/statistics.interface';
import {selectScale} from '../reducers/map-config.reducer';
import {selectItems} from './active-map-items.selector';

export const selectStatisticsQueries = createSelector(selectItems, selectScale, (items, scale): StatisticsQuery[] => {
  const queries = new Map<string, StatisticsQuery>();
  for (const {item, layers} of findVisibleMapLayers(items, scale)) {
    const topic = item.settings.mapId;
    for (const query of statisticsMapQueries[topic] ?? []) {
      if (layers.some((layer) => layer.layer === query.layer)) {
        queries.set(`${topic}/${query.layer}`, {topic, ...query});
      }
    }
  }
  return [...queries.values()];
});
