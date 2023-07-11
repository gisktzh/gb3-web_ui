/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface InfoJsonListData {
  /** print job creation endpoint URL */
  createURL?: string;
  outputFormats?: {
    /** output format name */
    name: string;
  }[];
  /** available scales */
  scales?: {
    /** scale name */
    name: string;
    /** scale denominator */
    value: number;
  }[];
  /** available dpis */
  dpis?: {
    /** dpi name */
    name: string;
    /** dpi value */
    value: number;
  }[];
  /** available layouts */
  layouts?: {
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
  required?: any;
}

export interface CreateCreatePayload {
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
      TRANSPARENT: boolean;
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
  pages?: {
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
    user_title: string;
    /**
     * user comment
     * @example "My comment"
     */
    user_comment: string;
    /**
     * header image URL
     * @example "http://127.0.0.1/images/LogoGIS.jpg"
     */
    header_img: string;
    /**
     * GB topic title
     * @example "Landeskarten, Übersichtsplan"
     */
    topic_title: string;
    /**
     * GB topic name
     * @example "BASISKARTEZH"
     */
    topic: string;
    /**
     * printout with legend included
     * @example 0
     */
    withlegend: number;
  }[];
}

export interface CreateCreateData {
  /** print document retrieval endpoint URL */
  getURL: string;
}

export type FavoritesListData = {
  /** Favorite ID */
  id: number;
  /** Favorite title */
  title: string;
  /** Favorite content */
  content: {
    /** duplicate of mapID */
    id?: string;
    /** name of map from which layers are referenced */
    mapId?: string;
    /** whether a set of layers is visible as a whole */
    visible?: boolean;
    /** opacity with which the layer is shown */
    opacity?: number;
    /** whether a layer is was added without adding the topic to which it belongs */
    isSingleLayer?: boolean;
    /** referenced layers */
    layers?: {
      /** layer ID */
      id?: number;
      /** layer name */
      layer?: string;
      /** whether a layer is visible */
      visible?: boolean;
    }[];
  }[];
  /**
   * Favorite updated at date and time
   * @format datetime
   */
  updated_at: string;
  /**
   * Favorite created at date and time
   * @format datetime
   */
  created_at: string;
}[];

export interface FavoritesCreatePayload {
  /** Favorite title */
  title: string;
  /** Favorite content */
  content: {
    /** duplicate of mapID */
    id?: string;
    /** name of map from which layers are referenced */
    mapId?: string;
    /** whether a set of layers is visible as a whole */
    visible?: boolean;
    /** opacity with which the layer is shown */
    opacity?: number;
    /** whether a layer is was added without adding the topic to which it belongs */
    isSingleLayer?: boolean;
    /** referenced layers */
    layers?: {
      /** layer ID */
      id?: number;
      /** layer name */
      layer?: string;
      /** whether a layer is visible */
      visible?: boolean;
    }[];
  }[];
}

export interface FavoritesDetailData {
  /** Favorite ID */
  id: number;
  /** Favorite title */
  title: string;
  /** Favorite content */
  content: {
    /** duplicate of mapID */
    id?: string;
    /** name of map from which layers are referenced */
    mapId?: string;
    /** whether a set of layers is visible as a whole */
    visible?: boolean;
    /** opacity with which the layer is shown */
    opacity?: number;
    /** whether a layer is was added without adding the topic to which it belongs */
    isSingleLayer?: boolean;
    /** referenced layers */
    layers?: {
      /** layer ID */
      id?: number;
      /** layer name */
      layer?: string;
      /** whether a layer is visible */
      visible?: boolean;
    }[];
  }[];
}

export type FavoritesDeleteData = any;

export interface TopicsFeatureInfoDetailData {
  feature_info: {
    /** Center x coord of query bbox */
    x: number;
    /** Center y coord of query bbox */
    y: number;
    results: {
      /** Topic name */
      topic: string;
      layers: {
        /** Layer name */
        layer: string;
        /** Layer title */
        title: string;
        features: {
          /** Feature ID */
          fid: number;
          /** Feature fields */
          fields: {
            /** Field label */
            label: string;
            /** Field value (string, numeric or null) */
            value: string | number | null;
          }[];
          /**
           * Bounding box of this feature
           * @maxItems 4
           * @minItems 4
           */
          bbox: number[];
          /** GeoJSON geometry */
          geometry: {
            /** GeoJSON geometry type */
            type: string;
            /** GeoJSON geometry coordinates */
            coordinates: any[];
          };
        }[];
      }[];
    };
  };
}

export interface GeneralInfoListData {
  general_info: {
    spatial_reference: {
      /** Coordinates */
      coordinates: number[];
      /** CRS */
      crs: string;
      /** Spatial Reference Name */
      name: string;
    };
    /** Height above sea level (Digitales Oberflächenmodell) */
    height_dom: number;
    /** Height above sea level (Digitales Terrainmodell) */
    height_dtm: number;
    /** Alternative spatial references */
    alternative_spatial_references: {
      /** Coordinates */
      coordinates: number[];
      /** CRS */
      crs: string;
      /** Spatial Reference Name */
      name: string;
    }[];
    /** External maps */
    external_maps: {
      /** Name */
      name: string;
      /** URL */
      url: string;
    }[];
    parcel: {
      /** BFS number */
      bfsnr: number;
      /** EGRIS egrid */
      egris_egrid: string;
      /** Municipality name */
      municipality_name: string;
      oereb_extract: {
        /** PDF URL */
        pdf_url: string;
      };
    } | null;
  };
}

export interface TopicsLegendDetailData {
  legend: {
    /** Topic name */
    topic: string;
    layers: {
      /** Layer name */
      layer: string;
      /** Layer title */
      title: string;
      layer_classes?: {
        /** Class label */
        label: string;
        /** Path to class image */
        image: string;
      }[];
      /** Layer attribution */
      attribution?: string;
      /** Geolion ID of layer */
      geolion?: number;
    }[];
  };
}

export interface TopicsListData {
  categories: {
    /** Category title */
    title: string;
    topics: {
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
      /** Topic-specific notice for end-users */
      notice: string | null;
      timesliderConfiguration: {
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
        sourceType: string;
        source: {
          /** for sourceType 'parameter': name of the filter for the starting date of selection */
          startRangeParameter?: string;
          /** for sourceType 'parameter': name of the filter for the ending date of selection */
          endRangeParameter?: string;
          /** for sourceType 'parameter':a list of unique layer identifiers affected by this timeslider */
          layerIdentifiers?: string[];
          /** for sourceType 'layer': a list of one to n layers and their date and name. Each entry in the list must contain the 'layer' and 'date' parameters */
          layers?: {
            /** for sourceType 'layer': unique name of the layer */
            layerName: string;
            /** for sourceType 'layer': the date associated with this layer (formatted according to the 'dateFormat' parameter) */
            date: string;
          }[];
        };
      };
      /** Filters Settings */
      filterConfigurations: {
        /** display name of the filter, which is used as a title for the filter options */
        name: string;
        /** additional description for the current filter */
        description?: string | null;
        /** name of the parameter which contains the filter values */
        parameter: string;
        /** a list of data (name/value pair) to filter by */
        filterValues: {
          /** name of the filter that is displayed in the UI */
          name: string;
          /** a list of strings containing the values to be filtered */
          values: string[];
        }[];
      }[];
      /** Search Settings */
      searchConfigurations:
        | {
            /** Human-Readable Search Title */
            title: string;
            /** Index Name */
            index: string;
          }[]
        | null;
      /**
       * WMS URL
       * @format uri
       */
      wms_url: string;
      /**
       * GB2 URL
       * @format uri
       */
      gb2_url: string | null;
      layers: {
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
        /** True if layer is queryable for this topic */
        queryable: boolean;
        /** True if unaccessible with current permissions. Not available in production environment. */
        permission_missing?: boolean;
      }[];
      /** Min allowed scale denominator */
      min_scale: number | null;
      /** True if unaccessible with current permissions. Not available in production environment. */
      permission_missing?: boolean;
    }[];
  }[];
}
