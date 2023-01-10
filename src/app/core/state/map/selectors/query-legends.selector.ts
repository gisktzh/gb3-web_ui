import {createSelector} from '@ngrx/store';
import {selectActiveMapItems} from '../reducers/active-map-item.reducer';

export const selectQueryLegends = createSelector(selectActiveMapItems, (activeMapItems) => {
  const queryLegends: string[] = [];

  activeMapItems.map(({topic}) => {
    queryLegends.push(topic.topic);
  });

  return queryLegends;
});
