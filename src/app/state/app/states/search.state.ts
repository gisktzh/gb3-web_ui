import {SearchResultMatch} from '../../../shared/services/apis/search/interfaces/search-result-match.interface';
import {Map} from '../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {SearchIndex} from '../../../shared/services/apis/search/interfaces/search-index.interface';

export interface SearchState {
  term: string;
  indexes: SearchIndex[];
  searchServiceLoadingState: LoadingState;
  searchServiceResults: SearchResultMatch[];
  filteredMaps: Map[];
  filteredMapsLoadingState: LoadingState;
}
