import {
  GeometrySearchApiResultMatch,
  SearchApiResultMatch,
} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';

export interface SearchState {
  term: string;
  searchApiLoadingState: LoadingState;
  searchApiResultMatches: SearchApiResultMatch[];
  filterGroups: SearchFilterGroup[];
  selectedSearchResult: GeometrySearchApiResultMatch | undefined;
}
