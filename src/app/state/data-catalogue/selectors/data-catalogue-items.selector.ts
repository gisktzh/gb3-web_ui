import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/data-catalogue.reducer';
import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';

export const selectDataCatalogueItems = createSelector(selectItems, selectActiveFiltersPerGroup, (items, activeFilters) => {
  if (activeFilters.length === 0) {
    return items;
  }

  return items.filter((item) => {
    return activeFilters.every(
      // typecast is safe here because we *know* the property exists, even though we don't know the actual type
      (activeFilter) => activeFilter.key in item && activeFilter.values.includes((item as any)[activeFilter.key]),
    );
  });
});
