import {RawSearchApiResultMatch} from './search-api-result-match.interface';

export interface SearchApiResult {
  index: string;
  matches: RawSearchApiResultMatch[];
}
