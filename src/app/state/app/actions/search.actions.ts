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
    'Set Search Api Error': errorProps(),
    'Set Search Api Results': props<{results: SearchApiResultMatch[]}>(),
    'Clear Search Term': emptyProps(),
    'Set Filter Groups': props<{filterGroups: SearchFilterGroup[]}>(),
    'Set Active Map Items Filter Group': props<{searchIndexes: SearchIndex[]}>(),
    'Set Filter Value': props<{groupLabel: string; filterLabel: string; isActive: boolean}>(),
    'Reset Filters': emptyProps(),
    'Reset Search and Filters': emptyProps(),
    'Select Search Result': props<{searchResult: GeometrySearchApiResultMatch}>(),
    'Clear Search Result': emptyProps(),
  },
});
