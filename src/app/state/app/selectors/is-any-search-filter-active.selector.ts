import {createSelector} from '@ngrx/store';
import {selectFilterGroups} from '../reducers/search.reducer';

export const selectIsAnySearchFilterActiveSelector = createSelector(selectFilterGroups, (filterGroups): boolean => {
  return filterGroups.flatMap((group) => group.filters).some((filter) => filter.isActive);
});
