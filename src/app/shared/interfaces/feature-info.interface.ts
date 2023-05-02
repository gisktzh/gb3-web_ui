import {Geometry} from 'geojson';

export interface FeatureInfoResultFeatureField {
  label: string;
  value: string | number | null;
}

export interface FeatureInfoResultFeature {
  fid: number;
  fields: FeatureInfoResultFeatureField[];
  bbox: number[];
  geometry: Geometry;
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

export interface FeatureInfoWrapper {
  x: number;
  y: number;
  heightDtm: number;
  heightDom: number;
  results: FeatureInfoResult;
}

export interface FeatureInfoResponse {
  featureInfo: FeatureInfoWrapper;
}

export interface FeatureInfoResultDisplay {
  title: string;
  layers: FeatureInfoResultLayer[];
  icon?: string;
  isSingleLayer: boolean;
}
