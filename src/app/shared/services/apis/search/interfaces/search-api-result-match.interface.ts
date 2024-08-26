import {GeometryWithSrs} from '../../../../interfaces/geojson-types-with-srs.interface';
import {SearchIndexType} from '../../../../configs/search-index.config';

export type SearchApiResultMatch = GeometrySearchApiResultMatch | MetadataSearchApiResultMatch | UnknownSearchApiResultMatch;

interface AbstractSearchApiResultMatch {
  indexType: SearchIndexType;
  score: number;
  indexName?: string;
}

export interface GeometrySearchApiResultMatch extends AbstractSearchApiResultMatch {
  indexType: 'addresses' | 'places' | 'gvz' | 'egid' | 'parcels' | 'egrid' | 'activeMapItems';
  displayString: string;
  geometry: GeometryWithSrs;
}

export interface MetadataSearchApiResultMatch extends AbstractSearchApiResultMatch {
  indexType: 'metadata-maps' | 'metadata-products' | 'metadata-datasets' | 'metadata-services';
  uuid: string;
}

export interface UnknownSearchApiResultMatch extends AbstractSearchApiResultMatch {
  indexType: 'unknown';
}

export function isGeometrySearchApiResultMatch(match: any): match is GeometrySearchApiResultMatch {
  return match.geometry && match.displayString && match.indexType && match.score;
}
