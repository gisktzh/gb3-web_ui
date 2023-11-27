import {createSelector} from '@ngrx/store';
import {selectFilters} from '../reducers/data-download-product.reducer';
import {ActiveDataDownloadFilterGroup} from '../../../shared/interfaces/data-download-filter.interface';

export const selectActiveDataDownloadFiltersPerCategory = createSelector(selectFilters, (filters): ActiveDataDownloadFilterGroup[] => {
  return filters
    .filter((filter) => filter.filterValues.some((filterValue) => filterValue.isActive))
    .map((filter) => {
      return {
        category: filter.category,
        values: filter.filterValues.filter((filterValue) => filterValue.isActive).map((filterValue) => filterValue.value),
      };
    });
});
