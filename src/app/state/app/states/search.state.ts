import {SearchResultMatch} from '../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {SearchFilterGroup} from '../../../shared/interfaces/search-filter-group.interface';

export interface SearchState {
  term: string;
  searchServiceLoadingState: LoadingState;
  searchServiceResults: SearchResultMatch[];
  filteredMaps: Map[];
  filteredMapsLoadingState: LoadingState;
  filterGroups: SearchFilterGroup[];
}
