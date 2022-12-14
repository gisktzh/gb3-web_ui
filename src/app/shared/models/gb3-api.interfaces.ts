/**
 * These internal models should be used when accessing API responses.
 */
interface LayerClass {
  label: string;
  image: string;
}

interface Layer {
  title: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  layer_classes?: LayerClass[];
  geolion?: number;
  attribution?: string;
}

export interface Legend {
  topic: string;
  layers: Layer[];
}

export interface LegendResponse {
  legend: Legend;
}

export interface FeatureInfoResultFeatureField {
  label: string;
  value: string | number | null;
}

export interface FeatureInfoResultFeature {
  fid: number;
  fields: FeatureInfoResultFeatureField[];
  bbox: number[];
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
  height_dtm: number;
  height_dom: number;
  results: FeatureInfoResult;
}

export interface FeatureInfoResponse {
  feature_info: FeatureInfoWrapper;
}
