import {GeometryWithSrs} from './geojson-types-with-srs.interface';
import {HasMetaDataLink} from './metaDataLink.interface';
import {IsSingleLayer} from './single-layer.interface';
import {LinkObject} from './link-object.interface';
import {Image} from './image.interface';
import {HasJasperReport} from './jasperReport.interface';

export type FeatureInfoResultFeatureFieldType = 'image' | 'link' | 'text';

export interface AbstractFeatureInfoResultFeatureField {
  label: string;
  type: FeatureInfoResultFeatureFieldType;
}

export interface FeatureInfoResultFeatureImageField extends AbstractFeatureInfoResultFeatureField {
  value: Image | null;
  type: 'image';
}

export interface FeatureInfoResultFeatureLinkField extends AbstractFeatureInfoResultFeatureField {
  value: LinkObject | null;
  type: 'link';
}

export interface FeatureInfoResultFeatureTextField extends AbstractFeatureInfoResultFeatureField {
  value: string | null;
  type: 'text';
}

export type FeatureInfoResultFeatureField =
  | FeatureInfoResultFeatureImageField
  | FeatureInfoResultFeatureLinkField
  | FeatureInfoResultFeatureTextField;

interface FeatureInfoResultFeature {
  fid: number;
  fields: FeatureInfoResultFeatureField[];
  geometry: GeometryWithSrs | undefined;
}

export interface FeatureInfoResultLayer extends HasMetaDataLink {
  layer: string;
  title: string;
  features: FeatureInfoResultFeature[];
}

export interface FeatureInfoResult extends HasMetaDataLink, IsSingleLayer, HasJasperReport {
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

export interface FeatureInfoResultDisplay extends HasMetaDataLink, IsSingleLayer, HasJasperReport {
  id: string;
  title: string;
  layers: FeatureInfoResultLayer[];
  icon?: string;
  /**
   * The Topic ID in the API - used for printing as id might also be our internal single layer id.
   */
  mapId: string;
}
