import {GeometrySearchApiResultMatch} from '../services/apis/search/interfaces/search-api-result-match.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Typeguard handling any kind of object that is thrown at it
export function isGeometrySearchApiResultMatch(match: any): match is GeometrySearchApiResultMatch {
  return match.geometry && match.displayString && match.indexType && match.score;
}
