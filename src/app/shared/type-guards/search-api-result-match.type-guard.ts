import {
  GeometrySearchApiResultMatch,
  MetadataSearchApiResultMatch,
} from '../services/apis/search/interfaces/search-api-result-match.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Typeguard handling any kind of object that is thrown at it
export function isGeometrySearchApiResultMatch(match: any): match is GeometrySearchApiResultMatch {
  return !!(match.geometry && match.displayString && match.score);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Typeguard handling any kind of object that is thrown at it
export function isMetadataSearchApiResultMatch(match: any): match is MetadataSearchApiResultMatch {
  return !!match.uuid;
}
