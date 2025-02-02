import {Gb3VectorLayer} from './gb3-vector-layer.interface';
import {AbstractGb3Layer} from './abstract-gb3-layer.interface';

export interface PrintCreation {
  /**
   * report layout
   * @example "A4"
   */
  reportLayout: string;
  /**
   * report layout
   * @example "standard"
   */
  reportType: string;
  /**
   * report orientation
   * @example "hoch"
   */
  reportOrientation: ReportOrientation | undefined;
  /**
   * Output format
   * @example "pdf"
   */
  format: string;
  attributes: PrintAttributes;
  map: PrintMap;
}

interface PrintAttributes {
  /**
   * Report title
   * @example "Landeskarten, Übersichtsplan"
   */
  reportTitle?: string;
  /**
   * User title
   * @example "User title"
   */
  userTitle?: string;
  /**
   * User comment
   * @example "User comment"
   */
  userComment?: string;
  /**
   * Show legend (default: false)
   * @example false
   */
  showLegend?: boolean;
}

interface PrintMap {
  /**
   * Map center
   * @maxItems 2
   * @minItems 2
   * @example [2683465,1248055]
   */
  center: number[];
  /**
   * Map scale
   * @example 25000
   */
  scale: number;
  /**
   * Map rotation
   * @example 0
   */
  rotation?: number;
  /**
   * DPI
   * @example 300
   */
  dpi: number;
  /** Map layers ordered from bottom to top */
  mapItems: PrintMapItem[];
}

export type PrintMapItem = PrintMapWms | Gb3VectorLayer;

interface PrintMapWms extends AbstractGb3Layer {
  /** WMS layer type */
  type: 'WMS';
  /**
   * WMS URL
   * @example "https://maps.zh.ch/wms/BASISKARTEZH"
   */
  url: string;
  /**
   * WMS layer names
   * @example ["wald","seen","gemeindegrenzen"]
   */
  layers: string[];
  /**
   * Custom WMS params
   * @example {"format":"image/png; mode=8bit","transparent":true}
   */
  customParams?: CustomPrintParameters;
  /**
   * Layer opacity
   * @min 0
   * @max 1
   * @example 1
   */
  opacity?: number;
  /** Map title (for Kartenset only) */
  mapTitle?: string;
  /**
   * Mark as background layer (for Kartenset only) (default: false)
   * @example false
   */
  background?: boolean;
}

export type ReportOrientation = 'landscape' | 'portrait';

export type ReportType = 'standard' | 'mapset';

export interface PrintCreationResponse {
  /** print document retrieval endpoint URL */
  reportUrl: string;
}

export interface DynamicStringParameters {
  [key: string]: string;
}

export interface CustomPrintParameters {
  transparent?: boolean;
  format?: string;
  dynamicStringParams: DynamicStringParameters;
}
