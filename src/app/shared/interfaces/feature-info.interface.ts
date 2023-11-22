import {GeometryWithSrs} from './geojson-types-with-srs.interface';
import {HasMetaDataLink} from './metaDataLink.interface';
import {SingleLayer} from './single-layer.interface';

export interface FeatureInfoResultFeatureField {
  label: string;
  value: string | number | null;
}

interface FeatureInfoResultFeature {
  fid: number;
  fields: FeatureInfoResultFeatureField[];
  bbox: number[];
  geometry: GeometryWithSrs;
}

export interface FeatureInfoResultLayer extends HasMetaDataLink {
  layer: string;
  title: string;
  features: FeatureInfoResultFeature[];
}

export interface FeatureInfoResult extends HasMetaDataLink, SingleLayer {
  topic: string;
  layers: FeatureInfoResultLayer[];
}

export interface FeatureInfoQueryLocation {
  x?: number;
  y?: number;
}

interface FeatureInfoWrapper extends FeatureInfoQueryLocation {
  results: FeatureInfoResult;
}

export interface FeatureInfoResponse {
  featureInfo: FeatureInfoWrapper;
}

export interface FeatureInfoResultDisplay extends HasMetaDataLink {
  id: string;
  title: string;
  layers: FeatureInfoResultLayer[];
  icon?: string;
  isSingleLayer: boolean;
  /**
   * The Topic ID in the API - used for printing as id might also be our internal single layer id.
   */
  mapId: string;
}
