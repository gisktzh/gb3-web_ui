import {SearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';

export interface SearchState {
  term: string;
  searchApiLoadingState: LoadingState;
  searchApiResultMatches: SearchApiResultMatch[];
  mapMatches: Map[];
  mapMatchesLoadingState: LoadingState;
  filterGroups: SearchFilterGroup[];
}
