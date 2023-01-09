import {createSelector} from '@ngrx/store';
import {selectActiveTopics} from '../reducers/active-topics.reducer';

export const selectQueryLegends = createSelector(selectActiveTopics, (activeTopics) => {
  const queryLegends: string[] = [];

  activeTopics.map(({topic: {topic}}) => {
    queryLegends.push(topic);
  });

  return queryLegends;
});
