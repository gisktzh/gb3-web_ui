import {createSelector} from '@ngrx/store';
import {selectFilteredMaps, selectFilterGroups, selectSearchServiceResults} from '../reducers/search.reducer';
import {SearchResultObject} from '../../../shared/interfaces/search-result.interface';

export const selectSearchResultObjects = createSelector(
  selectSearchServiceResults,
  selectFilteredMaps,
  selectFilterGroups,
  (searchServiceResults, filteredMaps, filterGroups): SearchResultObject[] => {
    const filteredResultObjects: SearchResultObject[] = [];
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    const isNoFilterActive = filters.every((filter) => !filter.isActive); // no filter active means all results are shown (all filters active === no filter active)
    const activeSearchFilterIndexes = filters.filter((filter) => filter.isActive || isNoFilterActive).map((filter) => filter.type);

    searchServiceResults.forEach((resultMatch) => {
      if (resultMatch.indexType && activeSearchFilterIndexes.includes(resultMatch.indexType)) {
        filteredResultObjects.push({type: resultMatch.indexType, resultMatch});
      } else {
        // TODO WES what now?
        console.warn(resultMatch);
      }
    });

    if (activeSearchFilterIndexes.includes('maps')) {
      filteredMaps.forEach((filteredMap) => {
        filteredResultObjects.push({type: 'maps', map: filteredMap});
      });
    }

    return filteredResultObjects;
  },
);
