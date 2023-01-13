import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';
import {QueryLegend} from '../../../../shared/interfaces/query-legend.interface';

export const selectQueryLegends = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLegends: QueryLegend[] = [];

  activeMapItems.map(({topic, layer}) => {
    queryLegends.push({topic: topic.topic, layer: layer?.layer});
  });

  return queryLegends;
});
