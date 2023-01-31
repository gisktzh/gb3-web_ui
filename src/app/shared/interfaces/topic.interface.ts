import {HasVisibility} from './has-visibility.interface';

export interface Topic {
  title: string;
  maps: Map[];
}

export interface Map {
  /** Map identifier */
  id: string;
  /** Map title */
  title: string;
  /** Map title for printing */
  printTitle: string;
  /** Path to topic image */
  icon: string;
  /** Organisation title */
  organisation: string | null;
  /** Geolion ID of map */
  geolion: number | null;
  /** Keywords */
  keywords: string[];
  /** True if this is a main map */
  mainLevel: boolean;
  /** True if this is a background map */
  backgroundLevel: boolean;
  /** True if this is a overlay map */
  overlayLevel: boolean;
  /**
   * WMS URL
   * @format uri
   */
  wmsUrl: string;
  layers: MapLayer[];
  /** Min allowed scale denominator */
  minScale: number | null;
  /** Topic name to load as background map if set */
  backgroundTopic: string | null;
  /** List of topic names to load as overlay maps */
  overlayTopics: string[];
  /** Available viewer tools */
  tools: string[];
  /** True if current user must sign in to view this topic */
  permissionMissing: boolean;
}

export interface MapLayer extends HasVisibility {
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
  topics: Topic[];
}
