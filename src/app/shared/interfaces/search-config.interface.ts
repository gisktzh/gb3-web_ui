import {SearchIndexType} from '../configs/search-index.config';
import {SearchFilterGroup} from './search-filter-group.interface';
import {SearchType} from '../types/search.type';

export interface SearchConfig {
  startPage: SearchDetailConfig;
  mapPage: SearchDetailConfig;
}

interface SearchDetailConfig {
  searchOptions: SearchOptions;
  resultGroups: SearchResultGroup[];
  filterGroups: SearchFilterGroup[];
}

export interface SearchOptions {
  searchIndexTypes: SearchIndexType[];
  maps: boolean;
  faq: boolean;
}

interface SearchResultGroup {
  label: string;
  types: SearchType[];
}
