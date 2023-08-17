import {SearchType} from '../types/search.type';
import {Map} from './topic.interface';
import {SearchResultMatch} from '../services/apis/search/interfaces/search-result-match.interface';
import {SearchIndexType} from '../configs/search-index.config';

export type SearchResultObject = FilteredMapResultObject | SearchServiceResultObject;

export interface AbstractResultObject {
  type: SearchType;
}

export interface FilteredMapResultObject extends AbstractResultObject {
  type: 'maps';
  map: Map;
}

export interface SearchServiceResultObject extends AbstractResultObject {
  type: SearchIndexType;
  resultMatch: SearchResultMatch;
}
