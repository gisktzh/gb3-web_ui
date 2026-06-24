import {SearchIndexType} from '../configs/search-index.config';
import {SearchFilterGroup} from './search-filter-group.interface';

export interface SearchConfig {
  startPage: SearchDetailConfig;
  mapPage: SearchDetailConfig;
  dataCatalogPage: SearchDetailConfig;
}

export interface SearchDetailConfig {
  searchOptions: SearchOptions;
  filterGroups: SearchFilterGroup[];
}

export interface SearchOptions {
  searchIndexTypes: SearchIndexType[];
  maps: boolean;
  faq: boolean;
}
