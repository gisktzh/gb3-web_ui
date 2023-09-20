import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/data-catalogue.reducer';
import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';
import {selectFilteredMetadataItems} from '../../app/selectors/search-results.selector';
import {selectTerm} from '../../app/reducers/search.reducer';

export const selectDataCatalogueItems = createSelector(
  selectItems,
  selectActiveFiltersPerGroup,
  selectTerm,
  selectFilteredMetadataItems,
  (items, activeFilters, searchTerm, filteredBySearch) => {
    if (activeFilters.length === 0 && searchTerm === '') {
      return items;
    }

    return items
      .filter((item) => {
        return activeFilters.every(
          // typecast is safe here because we *know* the property exists, even though we don't know the actual type
          (activeFilter) => activeFilter.key in item && activeFilter.values.includes((item as any)[activeFilter.key]),
        );
      })
      .filter((item) => {
        return searchTerm === '' || filteredBySearch.some((searchItem) => searchItem.uuid === item.uuid);
      });
  },
);
