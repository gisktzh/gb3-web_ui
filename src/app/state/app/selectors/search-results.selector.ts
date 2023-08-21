import {createSelector} from '@ngrx/store';
import {selectFilterGroups, selectMapMatches, selectSearchApiResultMatches} from '../reducers/search.reducer';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectAvailableSpecialSearchIndexes} from '../../map/selectors/available-search-index.selector';

export const selectFilteredSearchApiResultMatches = createSelector(
  selectSearchApiResultMatches,
  selectFilterGroups,
  selectAvailableSpecialSearchIndexes,
  (searchApiResultMatches, filterGroups, availableSpecialSearchIndexes): SearchApiResultMatch[] => {
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    if (filters.every((filter) => !filter.isActive)) {
      // no filter is active means all results are shown (all filters active === no filter active)
      return searchApiResultMatches;
    }

    const activeSearchFilterIndexes = filters.filter((filter) => filter.isActive).map((filter) => filter.type);
    return searchApiResultMatches.filter((resultMatch) => {
      switch (resultMatch.indexType) {
        case 'activeMapItems':
          const indexConfig = availableSpecialSearchIndexes.find(
            (specialIndex) => resultMatch.indexName && specialIndex.indexName.toLowerCase() === resultMatch.indexName.toLowerCase(),
          );
          return (
            indexConfig &&
            filters.some(
              (filter) =>
                filter.type === 'activeMapItems' &&
                filter.label.toLowerCase() === indexConfig.displayString.toLowerCase() &&
                filter.isActive,
            )
          );
        default:
          return resultMatch.indexType && activeSearchFilterIndexes.includes(resultMatch.indexType);
      }
    });
  },
);

export const selectFilteredMaps = createSelector(selectMapMatches, selectFilterGroups, (mapMatches, filterGroups): Map[] => {
  const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
  const isNoFilterActive = filters.every((filter) => !filter.isActive); // no filter active means all results are shown (all filters active === no filter active)
  const isMapFilterActive = isNoFilterActive || (filters.find((filter) => filter.type === 'maps')?.isActive ?? false);
  return isMapFilterActive ? mapMatches : [];
});
