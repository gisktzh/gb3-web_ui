import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/data-catalogue.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';

export const selectDataCatalogueItems = createSelector(selectItems, selectActiveFiltersPerGroup, (items, activeFilters) => {
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
