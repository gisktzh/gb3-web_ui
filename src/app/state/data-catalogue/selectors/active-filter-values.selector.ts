import {createSelector} from '@ngrx/store';
import {ActiveDataCatalogueFilter, ActiveDataCatalogueFilterGroup} from '../../../shared/interfaces/data-catalogue-filter.interface';

import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';

export const selectActiveFilterValues = createSelector<Record<string, any>, ActiveDataCatalogueFilterGroup[], ActiveDataCatalogueFilter[]>(
  selectActiveFiltersPerGroup,
  (filters) => {
    return filters.flatMap((filter) => filter.values.flatMap((filterValue) => ({key: filter.key, value: filterValue})));
  },
);
