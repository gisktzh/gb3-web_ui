import {HasVisibility} from '../../map/interfaces/has-visibility.interface';
import {HasHidingState} from './has-hiding-state.interface';
import {HasActiveState} from './has-active-state.interface';
import {HasOpacity} from '../../map/interfaces/has-opacity.interface';

export interface Topic {
  title: string;
  maps: Map[];
}

export interface Map extends HasOpacity {
  /** Map identifier */
  id: string;
  /** Map title */
  title: string;
  /** UUID from geommetadatabase */
  uuid: string | null;
  /** Map title for printing */
  printTitle: string;
  /** Path to topic image */
  icon: string;
  /** Organisation title */
  organisation: string | null;
  gb2Url: string | null;
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
  filterConfigurations?: FilterConfiguration[];
  searchConfigurations?: SearchConfiguration[];
  /** Topic-specific notice for end-users */
  notice: string | null;
}

export interface MapLayer extends HasVisibility, HasHidingState {
  /** Layer ID */
  id: number;
  /** Layer name */
  layer: string;
  /** UUID from geommetadatabase */
  uuid: string | null;
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
  /** name of the timeslider for displaying in UI */
  name: string;
  /** additional description for the current timeslider */
  description?: string | null;
  /** ISO-8601 format which is used for the timeslider data */
  dateFormat: string;
  /** lowermost (oldest) date for the displayed data range */
  minimumDate: string;
  /** uppermost (newest) date for the displayed data range */
  maximumDate: string;
  /** If flag is set, both date specifications (oldest and newest date) have to be used for time period selection */
  alwaysMaxRange: boolean;
  /** The minimum time span that can be selected in ISO-8601 time span format. If range or alwaysMaxRange is set, this value is ignored */
  minimalRange?: string | null;
  /** The fixed time span, which can be selected in ISO-8601 time span format; if alwaysMaxRange is set, this value is ignored */
  range?: string | null;
  /** type of the data source ('parameter' or 'layer') */
  sourceType: TimeSliderSourceType;
  source: TimeSliderParameterSource | TimeSliderLayerSource;
}

export interface TimeSliderParameterSource {
  /** for sourceType 'parameter': name of the filter for the starting date of selection */
  startRangeParameter: string;
  /** for sourceType 'parameter': name of the filter for the ending date of selection */
  endRangeParameter: string;
  /** for sourceType 'parameter':a list of unique layer identifiers affected by this timeslider */
  layerIdentifiers: string[];
}

export interface TimeSliderLayerSource {
  /** for sourceType 'layer': a list of one to n layers and their date and name. Each entry in the list must contain the 'layer' and 'date' parameters */
  layers: TimeSliderLayer[];
}

export interface TimeSliderLayer {
  /** for sourceType 'layer': unique name of the layer */
  layerName: string;
  /** for sourceType 'layer': the date associated with this layer (formatted according to the 'dateFormat' parameter) */
  date: string;
}

export type TimeSliderSourceType = 'parameter' | 'layer';

export interface FilterConfiguration {
  name: string;
  description?: string | null;
  parameter: string;
  filterValues: FilterValue[];
}

export interface FavouriteFilterConfiguration {
  parameter: string;
  activeFilters: string[];
}

export interface SearchConfiguration {
  index: string;
  title: string;
}

export interface FilterValue extends HasActiveState {
  name: string;
  values: (string | number)[];
}

export interface TopicsResponse {
  topics: Topic[];
}

export interface WmsFilterValue {
  name: string;
  value: string;
}
