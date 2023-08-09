import {createSelector} from '@ngrx/store';
import {selectFilters, selectItems} from '../reducers/data-catalogue.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';

export const selectActiveFilters = createSelector(selectFilters, (filters) => {
  return filters
    .filter((filter) => filter.filterValues.some((filterValue) => filterValue.isActive))
    .map((filter) => {
      return {
        key: filter.key,
        values: filter.filterValues.filter((filterValue) => filterValue.isActive).map((filterValue) => filterValue.value),
      };
    });
});

export const selectDataCatalogueItems = createSelector(selectItems, selectActiveFilters, (items, activeFilters) => {
  let filteredItems: OverviewMetadataItem[] = items;

  if (activeFilters.length > 0) {
    filteredItems = filteredItems.filter((item) => {
      return activeFilters.every(
        (activeFilter) => activeFilter.key in item && activeFilter.values.includes((item as any)[activeFilter.key]),
      ); // typecast is safe here
    });
  }

  return filteredItems;
});
