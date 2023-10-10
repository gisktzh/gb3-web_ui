import {Gb3VectorLayer} from './gb3-vector-layer.interface';

export interface PrintCapabilities {
  /** Available output formats */
  formats: string[];
  /** Available DPI settings */
  dpis: number[];
  /** Available print templates */
  reports: {
    layout: string;
    orientation?: ReportOrientation;
    map: {
      /** Width of map element in px @ 72dpi */
      width: number;
      /** Height of map element in px @ 72dpi */
      height: number;
    };
  }[];
}

export interface PrintCreation {
  /**
   * report layout
   * @example "A4"
   */
  reportLayout: string;
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

interface PrintMapWms {
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
  customParams?: object;
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

export type ReportOrientation = 'hoch' | 'quer';

export interface PrintCreationResponse {
  /** print document retrieval endpoint URL */
  reportUrl: string;
}
