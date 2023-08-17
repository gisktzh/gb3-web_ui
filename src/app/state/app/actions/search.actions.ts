import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {SearchResultMatch} from '../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Map} from '../../../shared/interfaces/topic.interface';
import {SearchOptions} from '../../../shared/interfaces/search-config.interface';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    'Search For Term': props<{term: string; group: SearchOptions}>(),
    'Set Search Service Error': errorProps(),
    'Set Search Service Results': props<{results: SearchResultMatch[]}>(),
    'Set Filtered Maps Error': errorProps(),
    'Set Filtered Maps Results': props<{filteredMaps: Map[]}>(),
    'Clear Search': emptyProps(),
    'Set Filter Groups': props<{filterGroups: SearchFilterGroup[]}>(),
    'Set Filter Value': props<{groupLabel: string; filterLabel: string; isActive: boolean}>(),
    'Reset Filters': emptyProps(),
  },
});
