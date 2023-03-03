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
  /**
   * WMS URL
   * @format uri
   */
  wmsUrl: string;
  layers: MapLayer[];
  /** Min allowed scale denominator */
  minScale: number | null;
  /** True if unaccessible with current permissions. Not available in production environment. */
  permissionMissing?: boolean;
  /** Timeslider Settings */
  timeSliderConfiguration?: TimeSliderConfiguration;
  /** Filters Settings */
  filterConfigurations?: AttributeFilterConfiguration[];
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
  /** True if layer is queryable by current user */
  queryable: boolean;
  /** True if unaccessible with current permissions. Not available in production environment. */
  permissionMissing?: boolean;
}

export interface TimeSliderConfiguration {
  name: string;
  description?: string;
  /** ISO-8601 date format (e.g. YYYY-MM-DD) */
  dateFormat: string;
  minimumDate: string;
  maximumDate: string;
  alwaysMaxRange: boolean;
  /** ISO-8601 date range (PnYnMnD) */
  minimalRange?: string;
  /** ISO-8601 date range (PnYnMnD) */
  range?: string;
  /** ISO-8601 date range (PnYnMnD) */
  sourceType: TimeSliderSourceType;
  source: TimeSliderParameterSource | TimeSliderLayerSource;
}

interface TimeSliderParameterSource {
  startRangeParameter: string;
  endRangeParameter: string;
  layerIdentifiers: string[];
}

interface TimeSliderLayerSource {
  layers: TimeSliderLayer[];
}

interface TimeSliderLayer {
  layerName: string;
  date: string;
}

type TimeSliderSourceType = 'parameter' | 'layer';

export interface AttributeFilterConfiguration {
  name: string;
  description?: string;
  parameter: string;
  filterValues: AttributeFilter[];
}

interface AttributeFilter {
  name: string;
  values: string[];
}

export interface TopicsResponse {
  topics: Topic[];
}
