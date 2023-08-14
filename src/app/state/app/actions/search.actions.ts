import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {SearchResultMatch} from '../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Map} from '../../../shared/interfaces/topic.interface';

export const SearchActions = createActionGroup({
  source: 'Search',
  events: {
    'Search Term And Indexes': props<{term: string; indexes: SearchIndex[]}>(),
    'Set Search Service Error': errorProps(),
    'Set Search Service Results': props<{results: SearchResultMatch[]}>(),
    'Set Filtered Maps Error': errorProps(),
    'Set Filtered Maps Results': props<{filteredMaps: Map[]}>(),
    Clear: emptyProps(),
  },
});
