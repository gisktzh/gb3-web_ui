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
  id: string;
  /** Favorite title */
  title: string;
  /** Favorite content */
  content: object;
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
  content: object;
}

export interface FavoritesDetailData {
  /** Favorite ID */
  id: string;
  /** Favorite title */
  title: string;
  /** Favorite content */
  content: object;
}

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
        /** True if layer is editable by current user */
        editable: boolean;
        /** True if layer is queryable for this topic */
        queryable: boolean;
      }[];
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
    }[];
  }[];
}
