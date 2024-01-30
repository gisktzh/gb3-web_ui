import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/data-catalogue.reducer';
import {selectActiveFiltersPerGroup} from './active-filters-per-group.selector';
import {selectFilteredMetadataItems} from '../../app/selectors/search-results.selector';
import {selectTerm} from '../../app/reducers/search.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';
import {DataCatalogueSearchResultDisplayItem} from '../../../shared/interfaces/data-catalogue-search-resuilt-display.interface';

export const selectDataCatalogueItems = createSelector(
  selectItems,
  selectActiveFiltersPerGroup,
  selectTerm,
  selectFilteredMetadataItems,
  (items, activeFilters, searchTerm, filteredBySearch): DataCatalogueSearchResultDisplayItem[] => {
    if (activeFilters.length === 0 && searchTerm === '') {
      return items.map((item) => item.getDisplayRepresentationForList());
    }

    // We cast to any because not all items have all the properties from DataCatalogueFilterConfiguration. To remove the cast, we would need to refactor
    return (items as any[])
      .filter((item) => {
        return activeFilters.every(
          // typecast is safe here because we *know* the property exists, even though we don't know the actual type
          (activeFilter) => {
            if (item[activeFilter.key] instanceof Array) {
              return activeFilter.key in item && item[activeFilter.key].some((value: string) => activeFilter.values.includes(value));
            } else {
              return activeFilter.key in item && activeFilter.values.includes(item[activeFilter.key]);
            }
          },
        );
      })
      .filter((item) => {
        return searchTerm === '' || filteredBySearch.some((searchItem) => searchItem.uuid === item.uuid);
      })
      .map((item: OverviewMetadataItem) => item.getDisplayRepresentationForList());
  },
);
