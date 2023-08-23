import {createSelector} from '@ngrx/store';
import {selectFilterGroups, selectMapMatches, selectSearchApiResultMatches} from '../reducers/search.reducer';
import {
  MetadataSearchApiResultMatch,
  SearchApiResultMatch,
} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectAvailableSpecialSearchIndexes} from '../../map/selectors/available-search-index.selector';
import {SearchType} from '../../../shared/types/search.type';
import {selectItems} from '../../data-catalogue/reducers/data-catalogue.reducer';
import {SearchIndexType} from '../../../shared/configs/search-index.config';
import {OverviewMetadataItem} from '../../../shared/models/overview-metadata-item.model';

export const selectFilteredSearchApiResultMatches = createSelector(
  selectSearchApiResultMatches,
  selectFilterGroups,
  selectAvailableSpecialSearchIndexes,
  (searchApiResultMatches, filterGroups, availableSpecialSearchIndexes): SearchApiResultMatch[] => {
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    // no filter is active means all results are shown (all filters active === no filter active)
    const noFilterActive = filters.every((filter) => !filter.isActive);

    const activeSearchFilterIndexes: Set<SearchType> = new Set(
      filters.filter((filter) => noFilterActive || filter.isActive).map((filter) => filter.type),
    );
    return searchApiResultMatches.filter((resultMatch) => {
      switch (resultMatch.indexType) {
        case 'activeMapItems':
          const indexConfig = availableSpecialSearchIndexes.find(
            (specialIndex) => resultMatch.indexName && specialIndex.displayString.toLowerCase() === resultMatch.indexName.toLowerCase(),
          );
          return (
            indexConfig &&
            filters.some(
              (filter) =>
                filter.type === 'activeMapItems' &&
                filter.label.toLowerCase() === indexConfig.displayString.toLowerCase() &&
                (noFilterActive || filter.isActive),
            )
          );
        default:
          return resultMatch.indexType && activeSearchFilterIndexes.has(resultMatch.indexType);
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

export const selectFilteredMetadataItems = createSelector(
  selectFilteredSearchApiResultMatches,
  selectItems,
  (filteredSearchApiResultMatches, metadataItems): OverviewMetadataItem[] => {
    const filteredMetadataItems: OverviewMetadataItem[] = [];
    const filteredMetadataMatches: MetadataSearchApiResultMatch[] = filteredSearchApiResultMatches
      .filter((filteredMatch) =>
        (['metadata-products', 'metadata-datasets', 'metadata-services', 'metadata-maps'] as SearchIndexType[]).includes(
          filteredMatch.indexType,
        ),
      )
      .map((filteredMatch) => filteredMatch as MetadataSearchApiResultMatch);

    filteredMetadataMatches.forEach((match) => {
      const metadataItem = metadataItems.find((item) => item.guid === +match.id);
      if (metadataItem) {
        filteredMetadataItems.push(metadataItem);
      }
    });
    return filteredMetadataItems;
  },
);
