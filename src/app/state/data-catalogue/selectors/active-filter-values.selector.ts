import {createSelector} from '@ngrx/store';

import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';

export const selectActiveFilterValues = createSelector(selectActiveFiltersPerGroup, (filters) => {
  return filters.flatMap((filter) => filter.values.flatMap((filterValue) => ({key: filter.key, value: filterValue})));
});
