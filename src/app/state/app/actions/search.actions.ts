import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Map} from '../../../shared/interfaces/topic.interface';
import {SearchOptions} from '../../../shared/interfaces/search-config.interface';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    'Search For Term': props<{term: string; options: SearchOptions}>(),
    'Set Search Api Error': errorProps(),
    'Set Search Api Results': props<{results: SearchApiResultMatch[]}>(),
    'Set Map Matches Error': errorProps(),
    'Set Map Matches Results': props<{mapMatches: Map[]}>(),
    'Clear Search': emptyProps(),
    'Set Filter Groups': props<{filterGroups: SearchFilterGroup[]}>(),
    'Set Active Map Items Filter Group': props<{searchIndexes: SearchIndex[]}>(),
    'Set Filter Value': props<{groupLabel: string; filterLabel: string; isActive: boolean}>(),
    'Reset Filters': emptyProps(),
  },
});
