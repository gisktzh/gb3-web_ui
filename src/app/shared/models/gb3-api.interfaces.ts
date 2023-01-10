/**
 * These internal models should be used when accessing API responses.
 */
import {Geometry} from 'geojson';

interface LayerClass {
  label: string;
  image: string;
}

interface Layer {
  layer: string;
  title: string;
  layerClasses?: LayerClass[];
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

export interface LayerCatalogItem {
  title: string;
  topics: Topic[];
}

export interface Topic {
  /** Topic name */
  topic: string;
  /** Topic title */
  title: string;
  /** Topic title for printing */
  printTitle: string;
  /** Path to topic image */
  icon: string;
  /** Organisation title */
  organisation: string | null;
  /** Geolion ID of topic */
  geolion: number | null;
  /** Keywords */
  keywords: string[];
  /** True if this is a main topic */
  mainLevel: boolean;
  /** True if this is a background topic */
  backgroundLevel: boolean;
  /** True if this is a overlay topic */
  overlayLevel: boolean;
  /**
   * WMS URL
   * @format uri
   */
  wmsUrl: string;
  layers: TopicLayer[];
  /** Min allowed scale denominator */
  minScale: number | null;
  /** Topic name to load as background topic if set */
  backgroundTopic: string | null;
  /** List of topic names to load as overlay topics */
  overlayTopics: string[];
  /** Available viewer tools */
  tools: string[];
  /** True if current user must sign in to view this topic */
  permissionMissing: boolean;
}

interface TopicLayer {
  /** Layer ID */
  id: number;
  /** Layer name */
  layer: string;
  /** Layer group title if set */
  groupTitle: string | null;
  /** Layer title */
  title: string;
  /** Min scale denominator where layer is visible */
  minScale: number;
  /** Max scale denominator where layer is visible */
  maxScale: number;
  /** Sort order for WMS requests */
  wmsSort: number;
  /** Sort order in TOC */
  tocSort: number;
  /** True if layer is initially enabled in TOC */
  initiallyVisible: boolean;
  /** True if layer is editable by current user */
  editable: boolean;
  /** True if layer is queryable by current user */
  queryable: boolean;
}

export interface TopicsResponse {
  layerCatalogItems: LayerCatalogItem[];
}

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
