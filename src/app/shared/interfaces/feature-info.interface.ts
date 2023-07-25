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
}

export interface FeatureInfoResult {
  topic: string;
  layers: FeatureInfoResultLayer[];
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
}
