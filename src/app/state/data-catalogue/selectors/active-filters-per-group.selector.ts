import {createSelector} from '@ngrx/store';
import {ActiveDataCatalogueFilterGroup, DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {selectFilters} from '../reducers/data-catalogue.reducer';

export const selectActiveFiltersPerGroup = createSelector<Record<string, any>, DataCatalogueFilter[], ActiveDataCatalogueFilterGroup[]>(
  selectFilters,
  (filters) => {
    return filters
      .filter((filter) => filter.filterValues.some((filterValue) => filterValue.isActive))
      .map((filter) => {
        return {
          key: filter.key,
          values: filter.filterValues.filter((filterValue) => filterValue.isActive).map((filterValue) => filterValue.value),
        };
      });
  },
);
