import {GeometryWithSrs} from './geojson-types-with-srs.interface';

interface FeatureInfoResultFeatureField {
  label: string;
  value: string | number | null;
}

interface FeatureInfoResultFeature {
  fid: number;
  fields: FeatureInfoResultFeatureField[];
  bbox: number[];
  geometry: GeometryWithSrs;
}

export interface FeatureInfoResultLayer {
  layer: string;
  title: string;
  features: FeatureInfoResultFeature[];
  metaDataLink?: string | null;
}

export interface FeatureInfoResult {
  topic: string;
  layers: FeatureInfoResultLayer[];
  metaDataLink?: string | null;
}

interface FeatureInfoWrapper {
  x: number;
  y: number;
  results: FeatureInfoResult;
}

export interface FeatureInfoResponse {
  featureInfo: FeatureInfoWrapper;
}

export interface FeatureInfoResultDisplay {
  id: string;
  title: string;
  layers: FeatureInfoResultLayer[];
  icon?: string;
  isSingleLayer: boolean;
  metaDataLink?: string | null;
}
