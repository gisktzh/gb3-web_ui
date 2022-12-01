/* eslint-disable @typescript-eslint/naming-convention */
/**
 * These internal models should be used when accessing API responses.
 */
interface LayerClass {
  label: string;
  image: string;
}

interface Layer {
  title: string;
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

export interface LayerCatalogItem {
  title: string;
  topics: Topic[];
}

interface Topic {
  /** Topic name */
  topic: string;
  /** Topic title */
  title: string;
  /** Topic title for printing */
  print_title: string;
  /** Path to topic image */
  icon: string;
  /** Organisation title */
  organisation: string | null;
  /** Geolion ID of topic */
  geolion: number | null;
  /** Keywords */
  keywords: string[];
  /** True if this is a main topic */
  main_level: boolean;
  /** True if this is a background topic */
  background_level: boolean;
  /** True if this is a overlay topic */
  overlay_level: boolean;
  /**
   * WMS URL
   * @format uri
   */
  wms_url: string;
  layers: TopicLayer[];
  /** Min allowed scale denominator */
  min_scale: number | null;
  /** Topic name to load as background topic if set */
  background_topic: string | null;
  /** List of topic names to load as overlay topics */
  overlay_topics: string[];
  /** Available viewer tools */
  tools: string[];
  /** True if current user must sign in to view this topic */
  permission_missing: boolean;
}

interface TopicLayer {
  /** Layer ID */
  id: number;
  /** Layer name */
  layer: string;
  /** Layer group title if set */
  group_title: string | null;
  /** Layer title */
  title: string;
  /** Min scale denominator where layer is visible */
  min_scale: number;
  /** Max scale denominator where layer is visible */
  max_scale: number;
  /** Sort order for WMS requests */
  wms_sort: number;
  /** Sort order in TOC */
  toc_sort: number;
  /** True if layer is initially enabled in TOC */
  initially_visible: boolean;
  /** True if layer is editable by current user */
  editable: boolean;
}

export interface TopicsResponse {
  layerCatalogItems: LayerCatalogItem[];
}
