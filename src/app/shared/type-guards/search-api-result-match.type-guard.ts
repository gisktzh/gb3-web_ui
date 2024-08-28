import {GeometrySearchApiResultMatch} from '../services/apis/search/interfaces/search-api-result-match.interface';

export function isGeometrySearchApiResultMatch(match: any): match is GeometrySearchApiResultMatch {
  return match.geometry && match.displayString && match.indexType && match.score;
}
