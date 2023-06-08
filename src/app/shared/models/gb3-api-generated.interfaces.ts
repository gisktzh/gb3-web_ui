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
    /** DTM height at query pos (-1 if unknown) */
    height_dtm: number;
    /** DOM height at query pos (-1 if unknown) */
    height_dom: number;
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
