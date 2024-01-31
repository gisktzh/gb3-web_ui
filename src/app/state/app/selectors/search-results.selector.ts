import {createSelector} from '@ngrx/store';
import {selectFilterGroups, selectSearchApiResultMatches, selectTerm} from '../reducers/search.reducer';
import {
  MetadataSearchApiResultMatch,
  SearchApiResultMatch,
} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {selectAvailableSpecialSearchIndexes} from '../../map/selectors/available-search-index.selector';
import {SearchType} from '../../../shared/types/search.type';
import {selectItems} from '../../data-catalogue/reducers/data-catalogue.reducer';
import {SearchIndexType} from '../../../shared/configs/search-index.config';
import {OverviewFaqItem, OverviewMetadataItem} from '../../../shared/models/overview-search-result.model';
import {selectFaq} from '../../support/reducers/support-content.reducer';
import {selectMaps} from '../../map/selectors/maps.selector';
import {OverviewSearchResultDisplayItem} from '../../../shared/interfaces/overview-search-resuilt-display.interface';

export const selectFilteredSearchApiResultMatches = createSelector(
  selectSearchApiResultMatches,
  selectFilterGroups,
  selectAvailableSpecialSearchIndexes,
  (searchApiResultMatches, filterGroups, availableSpecialSearchIndexes): SearchApiResultMatch[] => {
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    // no filter is active means all results are shown (all filters active === no filter active)
    const noFilterActive = filters.every((filter) => !filter.isActive);
    const activeSearchFilterIndexes: Set<SearchType> = new Set(filters.filter((filter) => filter.isActive).map((filter) => filter.type));

    return noFilterActive
      ? searchApiResultMatches // simply return all matches if no filter is active
      : searchApiResultMatches.filter((resultMatch) => {
          switch (resultMatch.indexType) {
            case 'activeMapItems':
              // the filters for this index type are created dynamically depending on the current active map items
              // first: find the search index config based on the index name (side-note: the 'indexName' in the search result
              //        is actually its label)
              const specialSearchIndex = availableSpecialSearchIndexes.find(
                (searchIndex) =>
                  resultMatch.indexName && searchIndex.label && searchIndex.label.toLowerCase() === resultMatch.indexName.toLowerCase(),
              );
              // secondly: now find the corresponding filter and use its 'isActive' value
              return (
                specialSearchIndex &&
                filters.some(
                  (filter) =>
                    filter.type === 'activeMapItems' &&
                    filter.label.toLowerCase() === specialSearchIndex.label.toLowerCase() &&
                    filter.isActive,
                )
              );
            default:
              return activeSearchFilterIndexes.has(resultMatch.indexType);
          }
        });
  },
);

export const selectFilteredLayerCatalogMaps = createSelector(
  selectTerm,
  selectMaps,
  selectFilterGroups,
  (searchTerm, maps, filterGroups): Map[] => {
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    const isNoFilterActive = filters.every((filter) => !filter.isActive); // no filter active means all results are shown (all filters active === no filter active)
    const isMapFilterActive = isNoFilterActive || (filters.find((filter) => filter.type === 'maps')?.isActive ?? false);
    const lowerCasedFilterString = searchTerm.toLowerCase();
    if (!isMapFilterActive || lowerCasedFilterString === '') {
      return [];
    }

    return maps.filter((map) => {
      // Return true if the map title OR one of the keywords includes the filter string
      return (
        map.title.toLowerCase().includes(lowerCasedFilterString) ||
        map.keywords.map((keyword) => keyword.toLowerCase()).includes(lowerCasedFilterString)
      );
    });
  },
);

export const selectFilteredMetadataItems = createSelector(
  selectFilteredSearchApiResultMatches,
  selectItems,
  (filteredSearchApiResultMatches, metadataItems): OverviewSearchResultDisplayItem[] => {
    const filteredMetadataItems: OverviewMetadataItem[] = [];
    const filteredMetadataMatches: MetadataSearchApiResultMatch[] = filteredSearchApiResultMatches
      .filter((filteredMatch) =>
        (['metadata-products', 'metadata-datasets', 'metadata-services', 'metadata-maps'] as SearchIndexType[]).includes(
          filteredMatch.indexType,
        ),
      )
      .map((filteredMatch) => filteredMatch as MetadataSearchApiResultMatch);

    filteredMetadataMatches.forEach((match) => {
      const metadataItem = metadataItems
        .filter((item) => {
          switch (match.indexType) {
            case 'metadata-maps':
              return item.type === 'Karte';
            case 'metadata-products':
              return item.type === 'Produkt';
            case 'metadata-datasets':
              return item.type === 'Geodatensatz';
            case 'metadata-services':
              return item.type === 'Geoservice';
          }
        })
        .find((item) => item.uuid === match.uuid);
      if (metadataItem) {
        filteredMetadataItems.push(metadataItem);
      }
    });
    return filteredMetadataItems.map((filteredMetadataItem) => filteredMetadataItem.createDisplayRepresentationForList());
  },
);

export const selectFilteredFaqItems = createSelector(
  selectTerm,
  selectFaq,
  selectFilterGroups,
  (searchTerm, faqCollections, filterGroups): OverviewSearchResultDisplayItem[] => {
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    const isNoFilterActive = filters.every((filter) => !filter.isActive); // no filter active means all results are shown (all filters active === no filter active)
    const isFaqFilterActive = isNoFilterActive || (filters.find((filter) => filter.type === 'faqs')?.isActive ?? false);
    const lowerCasedFilterString = searchTerm.toLowerCase();
    if (!isFaqFilterActive || lowerCasedFilterString === '') {
      return [];
    }

    return faqCollections
      .flatMap((faqCollection) => faqCollection.items)
      .filter((faqItem) => {
        // Return true if the map title OR one of the keywords includes the filter string
        return (
          faqItem.question.toLowerCase().includes(lowerCasedFilterString) || faqItem.answer.toLowerCase().includes(lowerCasedFilterString)
        );
      })
      .map((faqItem) => new OverviewFaqItem(faqItem.uuid, faqItem.question, faqItem.answer).createDisplayRepresentationForList());
  },
);
