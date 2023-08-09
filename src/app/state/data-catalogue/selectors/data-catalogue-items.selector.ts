import {createSelector} from '@ngrx/store';
import {selectDataCatalogueState} from '../reducers/data-catalogue.reducer';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';

export const selectDataCatalogueItems = createSelector(selectDataCatalogueState, ({items, activeFilters}) => {
  let filteredItems: OverviewMetadataItem[] = items;

  if (activeFilters.length > 0) {
    filteredItems = filteredItems.filter((item) => {
      return activeFilters.some((activeFilter) => activeFilter.key in item && (item as any)[activeFilter.key] === activeFilter.value); // typecast is safe here
    });
  }

  return filteredItems;
});
