import {GeometryWithSrs} from '../../../../interfaces/geojson-types-with-srs.interface';
import {SearchIndexType} from '../../../../configs/search-index.config';
import {Geometry} from 'geojson';

export type SearchApiResultMatch = GeometryWithSrsSearchApiResultMatch | MetadataSearchApiResultMatch | UnknownSearchApiResultMatch;

export type RawSearchApiResultMatch = GeometrySearchApiResultMatch | MetadataSearchApiResultMatch | UnknownSearchApiResultMatch;

interface AbstractSearchApiResultMatch {
  indexType: SearchIndexType;
  score: number;
  indexName?: string;
}

export interface GeometrySearchApiResultMatch extends AbstractSearchApiResultMatch {
  indexType: 'addresses' | 'places' | 'gvz' | 'egid' | 'parcels' | 'egrid' | 'activeMapItems';
  displayString: string;
  geometry: GeometryWithSrs | Geometry;
}

export interface GeometryWithSrsSearchApiResultMatch extends AbstractSearchApiResultMatch {
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
