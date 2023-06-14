export interface PrintInfo {
  /** print job creation endpoint URL */
  createURL?: string;
  outputFormats: {
    /** output format name */
    name: string;
  }[];
  /** available scales */
  scales: {
    /** scale name */
    name: string;
    /** scale denominator */
    value: number;
  }[];
  /** available dpis */
  dpis: {
    /** dpi name */
    name: string;
    /** dpi value */
    value: number;
  }[];
  /** available layouts */
  layouts: {
    /** layout name */
    name:
      | 'A4 hoch'
      | 'A4 quer'
      | 'A3 hoch'
      | 'A3 quer'
      | 'A2 hoch'
      | 'A2 quer'
      | 'A1 hoch'
      | 'A1 quer'
      | 'A0 hoch'
      | 'A0 quer'
      | 'FomesBeitragsabrechnung'
      | 'Strassenlaerm'
      | 'Baustellen_SR'
      | 'Baustellen_UB'
      | 'Baustellen_ZH'
      | 'Baustellen_SR_edit'
      | 'Baustellen_UB_edit'
      | 'Baustellen_ZH_edit'
      | 'Forstfeuer'
      | 'Fluglaerm'
      | 'Schadenmeldeformular'
      | 'Naturgefahren'
      | 'Kartenset'
      | 'Wanderwege';
    map: {
      /** map width in pixels */
      width: number;
      /** map height in pixels */
      height: number;
    };
    /** rotation allowed */
    rotation: boolean;
  }[];
}

export interface PrintCreation {
  /**
   * units
   * @example "m"
   */
  units: string;
  /**
   * srs
   * @example "EPSG:2056"
   */
  srs: string;
  /**
   * layout
   * @example "A4 hoch"
   */
  layout: string;
  /**
   * dpi
   * @example 300
   */
  dpi: number;
  /**
   * outputFormat
   * @example "pdf"
   */
  outputFormat: string;
  /**
   * layers for use in WMS GetMap request
   * @minItems 1
   */
  layers: {
    /**
     * base WMS URL
     * @example "http://127.0.0.1:3000/wms/BASISKARTEZH"
     */
    baseURL: string;
    /**
     * opacity
     * @example 1
     */
    opacity: number;
    /**
     * singleTile
     * @example true
     */
    singleTile: boolean;
    /**
     * type
     * @example "WMS"
     */
    type: string;
    /**
     * requested WMS layers
     * @minItems 1
     * @example ["wald","seen"]
     */
    layers: string[];
    /**
     * format
     * @example "image/png; mode=8bit"
     */
    format: string;
    /** styles */
    styles: string[];
    /** custom parameters */
    customParams: {
      /**
       * TRANSPARENT
       * @example true
       */
      transparent: boolean;
      /**
       * dpi
       * @example 96
       */
      dpi: number;
      /**
       * format
       * @example "image/png; mode=8bit"
       */
      format: string;
    } | null;
  }[];
  /** pages */
  pages: {
    /**
     * center lat/lon in srs units
     * @maxItems 2
     * @minItems 2
     * @example [2692500,1252500]
     */
    center: number[];
    /**
     * scale denominator
     * @example 5000
     */
    scale: number;
    /**
     * rotation in degrees
     * @example 0
     */
    rotation: number;
    /**
     * extent in srs units
     * @maxItems 4
     * @minItems 4
     * @example [2663148,1215246,2721851,1289753]
     */
    extent: number[];
    /**
     * user title
     * @example "My title"
     */
    userTitle: string;
    /**
     * user comment
     * @example "My comment"
     */
    userComment: string;
    /**
     * header image URL
     * @example "http://127.0.0.1/images/LogoGIS.jpg"
     */
    headerImg: string;
    /**
     * GB topic title
     * @example "Landeskarten, Übersichtsplan"
     */
    topicTitle: string;
    /**
     * GB topic name
     * @example "BASISKARTEZH"
     */
    topic: string;
    /**
     * printout with legend included
     * @example 0
     */
    withLegend: number;
  }[];
}

export interface PrintCreationResponse {
  /** print document retrieval endpoint URL */
  getURL: string;
}
