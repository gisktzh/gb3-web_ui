import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {
  GeometrySearchApiResultMatch,
  SearchApiResultMatch,
} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {SearchOptions} from '../../../shared/interfaces/search-config.interface';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    'Search For Term': props<{term: string; options: SearchOptions}>(),
    'Search For Term From Url Params': props<{
      searchTerm: string;
      searchIndex: SearchIndex;
    }>(),
    'Initialize Search From Url Parameters': props<{
      searchTerm: string | undefined;
      searchIndex: string | undefined;
      basemapId: string;
      initialMaps: string[];
    }>(),
    'Set Search Api Error': errorProps(),
    'Set Search Api Results': props<{results: SearchApiResultMatch[]}>(),
    'Clear Search Term': emptyProps(),
    'Set Filter Groups': props<{filterGroups: SearchFilterGroup[]}>(),
    'Set Active Map Items Filter Group': props<{searchIndexes: SearchIndex[]}>(),
    'Set Filter Value': props<{groupLabel: string; filterLabel: string; isActive: boolean}>(),
    'Reset Filters': emptyProps(),
    'Reset Search and Filters': emptyProps(),
    'Select Map Search Result': props<{searchResult: GeometrySearchApiResultMatch}>(),
    'Handle Empty Results From Url Search': props<{searchTerm: string}>(),
    'Handle Invalid Parameters': emptyProps(),
    'Reset Loading State': emptyProps(),
  },
});
