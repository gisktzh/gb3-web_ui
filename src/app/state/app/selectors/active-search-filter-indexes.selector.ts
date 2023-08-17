import {createSelector} from '@ngrx/store';
import {selectFilterGroups} from '../reducers/search.reducer';
import {SearchType} from '../../../shared/types/search.type';

export const selectActiveSearchFilterIndexes = createSelector(selectFilterGroups, (filterGroups): SearchType[] => {
  return filterGroups
    .flatMap((filterGroup) => filterGroup.filters)
    .filter((filter) => filter.isActive)
    .map((filter) => filter.type);
});
