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

export interface General {
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

export interface Product {
  /** Product UUID */
  uuid: string;
  /** Product GDP-Nummer */
  gdpnummer: number;
  /** Name des Geodatenprodukts */
  name: string;
  /** Beschreibung */
  beschreibung: string;
  /** Link auf Bild */
  image_url: string | null;
  kontakt: {
    /** Kontakt: Zuständig für Geometadaten */
    metadaten: {
      /** Amt */
      amt: string;
      /** Fachstelle */
      fachstelle: string | null;
      /** Sektion */
      sektion: string | null;
      /** Vorname */
      vorname: string;
      /** Nachname */
      nachname: string;
      /** Strassenname */
      strassenname: string;
      /** Hausnummer */
      hausnummer: number;
      /** Postfach */
      postfach: string | null;
      /** PLZ */
      plz: number;
      /** Ortschaft */
      ortschaft: string;
      /** Telephon */
      telephon: string;
      /** Telephon direkt */
      telephon_direkt: string;
      /** E-Mail */
      email: string;
      /** URL */
      weburl: string;
    };
  };
  datasets: {
    /** Dataset UUID */
    uuid: string;
    /** Dataset GIS-ZH-Nummer */
    giszhnr: number;
    /** Name des Geodatensatzes */
    name: string;
    /** Kurzbeschreibung des Geodatensatzes */
    kurzbeschreibung: string;
    /** Link auf Geodatashop bei NOGD-Daten */
    url_shop: string | null;
  }[];
}

export interface MetadataProduct {
  product: Product;
}

export interface MetadataProducts {
  products: Product[];
}

export interface Map {
  /** Map UUID */
  uuid: string;
  /** Map GB2-Nummer */
  gb2_id: number;
  /** Topic name */
  topic: string;
  /** Kartenname */
  name: string;
  /** Beschreibung der Karte */
  beschreibung: string;
  /** Link auf Bild */
  image_url: string | null;
  kontakt: {
    /** Kontakt: Verantwortlich für Geodaten */
    geodaten: {
      /** Amt */
      amt: string;
      /** Fachstelle */
      fachstelle: string | null;
      /** Sektion */
      sektion: string | null;
      /** Vorname */
      vorname: string;
      /** Nachname */
      nachname: string;
      /** Strassenname */
      strassenname: string;
      /** Hausnummer */
      hausnummer: number;
      /** Postfach */
      postfach: string | null;
      /** PLZ */
      plz: number;
      /** Ortschaft */
      ortschaft: string;
      /** Telephon */
      telephon: string;
      /** Telephon direkt */
      telephon_direkt: string;
      /** E-Mail */
      email: string;
      /** URL */
      weburl: string;
    };
  };
  datasets: {
    /** Dataset UUID */
    uuid: string;
    /** Dataset GIS-ZH-Nummer */
    giszhnr: number;
    /** Name des Geodatensatzes */
    name: string;
    /** Kurzbeschreibung des Geodatensatzes */
    kurzbeschreibung: string;
    /** Link auf Geodatashop bei NOGD-Daten */
    url_shop: string | null;
  }[];
}

export interface MetadataMap {
  map: Map;
}

export interface MetadataMaps {
  maps: Map[];
}

export interface Dataset {
  /** UUID */
  uuid: string;
  /** Dataset GIS-ZH-Nummer */
  giszhnr: number;
  /** Name des Geodatensatzes */
  name: string;
  /** Kurzbeschreibung */
  kurzbeschreibung: string;
  /** Beschreibung */
  beschreibung: string;
  /** eCH Geokategorien / Themen */
  themen: string | null;
  /** Schlüsselwörter */
  keywords: string | null;
  /** Datengrundlage */
  datengrundlage: string | null;
  /** Bemerkungen */
  bemerkungen: string | null;
  /** Abgabeformat */
  abgabeformat: string;
  /** Anwendungeinschränkung */
  anwendungeinschraenkung: string;
  /** Link auf Bild */
  image_url: string | null;
  /** Name des PDFs */
  pdf_name: string | null;
  /** Link auf PDF */
  pdf_url: string | null;
  /** Link auf Geodatashop bei NOGD-Daten */
  url_shop: string | null;
  kontakt: {
    /** Kontakt: Verantwortlich für Geodaten */
    geodaten: {
      /** Amt */
      amt: string;
      /** Fachstelle */
      fachstelle: string | null;
      /** Sektion */
      sektion: string | null;
      /** Vorname */
      vorname: string;
      /** Nachname */
      nachname: string;
      /** Strassenname */
      strassenname: string;
      /** Hausnummer */
      hausnummer: number;
      /** Postfach */
      postfach: string | null;
      /** PLZ */
      plz: number;
      /** Ortschaft */
      ortschaft: string;
      /** Telephon */
      telephon: string;
      /** Telephon direkt */
      telephon_direkt: string;
      /** E-Mail */
      email: string;
      /** URL */
      weburl: string;
    };
    /** Kontakt: Zuständig für Geometadaten */
    metadaten: {
      /** Amt */
      amt: string;
      /** Fachstelle */
      fachstelle: string | null;
      /** Sektion */
      sektion: string | null;
      /** Vorname */
      vorname: string;
      /** Nachname */
      nachname: string;
      /** Strassenname */
      strassenname: string;
      /** Hausnummer */
      hausnummer: number;
      /** Postfach */
      postfach: string | null;
      /** PLZ */
      plz: number;
      /** Ortschaft */
      ortschaft: string;
      /** Telephon */
      telephon: string;
      /** Telephon direkt */
      telephon_direkt: string;
      /** E-Mail */
      email: string;
      /** URL */
      weburl: string;
    };
  };
  maps: {
    /** Map UUID */
    uuid: string;
    /** Map GB2-ID */
    gb2_id: number;
    /** Topic name */
    topic: string;
    /** Kartenname */
    name: string;
  }[];
  layers: {
    /** Layer GIS-ZH-Nummer */
    giszhnr: string;
    /** Layername */
    name: string;
    /** Beschreibung des Layers */
    beschreibung: string;
    /** Metadaten Sichtbarkeit */
    metadaten_sichtbarkeit: string;
    /** Datenbezugart */
    datenbezugart: string;
  }[];
  services: {
    /** Service UUID */
    uuid: string;
    /** Geodaten-Service-Nummer */
    gdsernummer: number;
    /** Servicetyp, z.B. WMS, WFS */
    servicetyp: string;
    /** Servicename */
    name: string;
  }[];
  products: {
    /** Product UUID */
    uuid: string;
    /** Geodatenprodukt-Nummer */
    gdpnummer: number;
    /** Produktname */
    name: string;
  }[];
}

export interface MetadataDataset {
  dataset: Dataset;
}

export interface MetadataDatasets {
  datasets: Dataset[];
}

export type FavoriteDrawings = VectorLayer;

export type FavoriteMeasurements = VectorLayer;

export type FavoriteContent = {
  /** ID of the map */
  id: string;
  /** ID of the map */
  mapId: string;
  /** Visibility of the map */
  visible: boolean;
  /** Opacity of the map */
  opacity: number;
  /** Single layer of the map */
  isSingleLayer: boolean;
  layers: {
    /** ID of the layer */
    id: number;
    /** Layer of the map */
    layer: string;
    /** Visibility of the layer */
    visible: boolean;
  }[];
}[];

export type FavoriteContentNew = {
  /** ID of the map */
  mapId: string;
  /** Visibility of the map */
  visible: boolean;
  /** Opacity of the map */
  opacity: number;
  /** Single layer of the map */
  isSingleLayer: boolean;
  layers: {
    /** ID of the layer */
    id: number;
    /** Layer of the map */
    layer: string;
    /** Visibility of the layer */
    visible: boolean;
  }[];
}[];

export interface SharedFavorite {
  /** UUID of the favorite */
  id: string;
  /** Name of the owner of the favorite */
  owner: string | null;
  /** LV95 East coordinate of the favorite */
  east: number;
  /** LV95 North coordinate of the favorite */
  north: number;
  /** Scale denominator of the favorite */
  scaledenom: number;
  /** Basemap of the favorite */
  basemap: string;
  /**
   * Creation date of the favorite
   * @format date_time
   */
  created_at: string;
  /**
   * Update date of the favorite
   * @format date_time
   */
  updated_at: string;
  content: FavoriteContent;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
}

export interface SharedFavoriteNew {
  /**
   * LV95 East coordinate of the favorite
   * @example 2600100
   */
  east: number;
  /**
   * LV95 North coordinate of the favorite
   * @example 1100100
   */
  north: number;
  /**
   * Scale denominator of the favorite
   * @example 1100
   */
  scaledenom: number;
  /**
   * Basemap of the favorite
   * @example "basemap1"
   */
  basemap: string;
  content: FavoriteContentNew;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
}

export interface PersonalFavorite {
  /** UUID of the favorite */
  id: string;
  /** Title of the favorite */
  title: string;
  /** LV95 East coordinate of the favorite */
  east: number;
  /** LV95 North coordinate of the favorite */
  north: number;
  /** Scale denominator of the favorite */
  scaledenom: number;
  /** Basemap of the favorite */
  basemap: string;
  /**
   * Creation date of the favorite
   * @format date_time
   */
  created_at: string;
  /**
   * Update date of the favorite
   * @format date_time
   */
  updated_at: string;
  content: FavoriteContent;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
}

export interface PersonalFavoriteNew {
  /** Title of the favorite */
  title: string;
  /**
   * LV95 East coordinate of the favorite
   * @example 2600100
   */
  east: number;
  /**
   * LV95 North coordinate of the favorite
   * @example 1100100
   */
  north: number;
  /**
   * Scale denominator of the favorite
   * @example 1100
   */
  scaledenom: number;
  /** Basemap of the favorite */
  basemap: string;
  content: FavoriteContentNew;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
}

export interface Legend {
  legend: {
    /** Topic name */
    topic: string;
    /** Geolion ID of topic */
    geolion_gdd: number | null;
    /** UUID from geommetadatabase */
    geolion_karten_uuid: string | null;
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
      geolion_gds: number | null;
      /** UUID from geommetadatabase */
      geolion_geodatensatz_uuid: string | null;
    }[];
  };
}

export interface Feature {
  feature_info: {
    /** Center x coord of query bbox */
    x: number;
    /** Center y coord of query bbox */
    y: number;
    results: {
      /** Topic name */
      topic: string;
      /** Geolion ID of topic */
      geolion_gdd: number | null;
      /** UUID from geommetadatabase */
      geolion_karten_uuid: string | null;
      layers: {
        /** Layer name */
        layer: string;
        /** Layer title */
        title: string;
        /** Geolion ID of layer */
        geolion_gds: number | null;
        /** UUID from geommetadatabase */
        geolion_geodatensatz_uuid: string | null;
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
            coordinates: (number | number[] | number[][][])[];
          };
        }[];
      }[];
    };
  };
}

export interface GeometryCrs {
  /**
   * GeoJSON crs type
   * @example "name"
   */
  type: 'name';
  properties: {
    /**
     * GeoJSON crs name
     * @example "EPSG:2056"
     */
    name: string;
  };
}

/** GeoJSON geometry object */
export interface Geometry {
  /**
   * Type of GeoJSON geometry object
   * @example "Polygon"
   */
  type: 'Polygon' | 'Point' | 'LineString' | 'MultiPoint' | 'MultiPolygon';
  crs?: GeometryCrs;
  /**
   * coordinates for GeoJSON geometry object
   * @example [[[2681730,1247976],[2680217,1249161],[2680809,1250249],[2681937,1249504],[2681730,1247976]],[[2680836,1249355],[2681554,1249477],[2681327,1248867],[2680836,1249355]]]
   */
  coordinates: (number | number[] | number[][] | number[][][])[];
}

export interface GeojsonFeature {
  /** GeoJSON Feature */
  type: 'Feature';
  properties: {
    /**
     * Reference to style ID in 'styles'
     * @example "a"
     */
    style: string;
    /**
     * Text to display if using text marker style
     * @example "Label text"
     */
    text?: string;
  };
  /** GeoJSON geometry object */
  geometry: Geometry;
}

/**
 * GeoJSON FeatureCollection
 * @example {"type":"FeatureCollection","features":[{"type":"Feature","properties":{"style":"a"},"geometry":{"type":"Point","coordinates":[2683465,1248055]}}]}
 */
export interface GeojsonFeatureCollection {
  /** GeoJSON FeatureCollection */
  type: 'FeatureCollection';
  features: GeojsonFeature[];
}

/**
 * Style definitions for features. NOTE: keys are style IDs referenced in feature 'style' property
 * @example {"a":{"pointRadius":15,"fillColor":"#ee3333","fillOpacity":0,"strokeColor":"#ee3333","strokeWidth":3}}
 */
export type VectorLayerStyles = {
  /** Style definition based on OpenLayers 2 Symbolizer. NOTE: Style properties are optional. */
  a?: {
    /** Fill color of the drawing */
    fillColor?: string;
    /** Fill opacity of the drawing */
    fillOpacity?: number;
    /** Rotation of the drawing */
    rotation?: string;
    /** External graphic of the drawing */
    externalGraphic?: string | null;
    /** Graphic name of the drawing */
    graphicName?: string;
    /** Graphic opacity of the drawing */
    graphicOpacity?: number | null;
    /** Point radius of the drawing */
    pointRadius?: number;
    /** Stroke color of the drawing */
    strokeColor?: string;
    /** Stroke opacity of the drawing */
    strokeOpacity?: number;
    /** Stroke width of the drawing */
    strokeWidth?: number;
    /** Stroke linecap of the drawing */
    strokeLinecap?: string;
    /** Stroke linejoin of the drawing */
    strokeLinejoin?: string;
    /** Stroke dashstyle of the drawing */
    strokeDashstyle?: string;
    /** Font color of the drawing */
    fontColor?: string;
    /** Font family of the drawing */
    fontFamily?: string;
    /** Font size of the drawing */
    fontSize?: string;
    /** Font style of the drawing */
    fontStyle?: string;
    /** Font weight of the drawing */
    fontWeight?: string;
    /** Halo color of the drawing */
    haloColor?: string;
    /** Halo opacity of the drawing */
    haloOpacity?: string;
    /** Halo radius of the drawing */
    haloRadius?: string;
    /** Label of the drawing */
    label?: string;
    /** Label align of the drawing */
    labelAlign?: string;
    /** Label rotation of the drawing */
    labelRotation?: string;
    /** Label X offset of the drawing */
    labelXOffset?: string;
    /** Label Y offset of the drawing */
    labelYOffset?: string;
  };
};

/** Vector layer */
export interface VectorLayer {
  /** Vector layer type */
  type: 'Vector';
  /** GeoJSON FeatureCollection */
  geojson: GeojsonFeatureCollection;
  /** Style definitions for features. NOTE: keys are style IDs referenced in feature 'style' property */
  styles: VectorLayerStyles;
}

export interface Service {
  /** Service UUID */
  uuid: string;
  /** Service GDSer-Nummer */
  gdsernummer: number;
  /** Servicetyp, z.B. WMS, WFS */
  servicetyp: string;
  /** Name des Geodienstes */
  name: string;
  /** Beschreibung */
  beschreibung: string;
  /** URL */
  url: string;
  /** Version */
  version: string;
  /** Zugang */
  zugang: string;
  /** Link auf Bild */
  image_url: string | null;
  kontakt: {
    /** Kontakt: Zuständig für Geometadaten */
    metadaten: {
      /** Amt */
      amt: string;
      /** Fachstelle */
      fachstelle: string | null;
      /** Sektion */
      sektion: string | null;
      /** Vorname */
      vorname: string;
      /** Nachname */
      nachname: string;
      /** Strassenname */
      strassenname: string;
      /** Hausnummer */
      hausnummer: number;
      /** Postfach */
      postfach: string | null;
      /** PLZ */
      plz: number;
      /** Ortschaft */
      ortschaft: string;
      /** Telephon */
      telephon: string;
      /** Telephon direkt */
      telephon_direkt: string;
      /** E-Mail */
      email: string;
      /** URL */
      weburl: string;
    };
  };
  datasets: {
    /** Dataset UUID */
    uuid: string;
    /** Dataset GIS-ZH-Nummer */
    giszhnr: number;
    /** Name des Geodatensatzes */
    name: string;
    /** Kurzbeschreibung des Geodatensatzes */
    kurzbeschreibung: string;
    /** Link auf Geodatashop bei NOGD-Daten */
    url_shop: string | null;
  }[];
}

export interface MetadataService {
  service: Service;
}

export interface MetadataServices {
  services: Service[];
}

export interface Topics {
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
      geolion_gdd: number | null;
      /** UUID from geommetadatabase */
      geolion_karten_uuid: string | null;
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
        /** Geolion ID of layer */
        geolion_gds: number | null;
        /** UUID from geommetadatabase */
        geolion_geodatensatz_uuid: string | null;
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

export interface PrintCapabilities {
  print: {
    /** Available output formats */
    formats: string[];
    /** Available DPI settings */
    dpis: number[];
    /** Available print templates */
    reports: {
      /** Report name */
      name: string;
      map: {
        /** Width of map element in px @ 72dpi */
        width: number;
        /** Height of map element in px @ 72dpi */
        height: number;
      };
    }[];
  };
}

export interface PrintNew {
  /**
   * Report name
   * @example "A4 hoch"
   */
  report: string;
  /**
   * Output format
   * @example "pdf"
   */
  format: string;
  attributes: {
    /**
     * Report title
     * @example "Landeskarten, Übersichtsplan"
     */
    report_title?: string;
    /**
     * User title
     * @example "User title"
     */
    user_title?: string;
    /**
     * User comment
     * @example "User comment"
     */
    user_comment?: string;
    /**
     * Show legend (default: false)
     * @example false
     */
    show_legend?: boolean;
  };
  map: {
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
    layers: (
      | {
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
          custom_params?: object;
          /**
           * Layer opacity
           * @min 0
           * @max 1
           * @example 1
           */
          opacity?: number;
          /** Map title (for Kartenset only) */
          map_title?: string;
          /**
           * Mark as background layer (for Kartenset only) (default: false)
           * @example false
           */
          background?: boolean;
        }
      | VectorLayer
    )[];
  };
}

export interface PrintFeatureInfoNew {
  /** List of query topics */
  query_topics: {
    /**
     * Topic name
     * @example "BASISKARTEZH"
     */
    topic: string;
    /**
     * Query layers
     * @example ["gemeindegrenzen","adressen","haltestellen"]
     */
    layers: string[];
  }[];
  /**
   * Query bounding box as minx, miny, maxx, maxy coords (default in EPSG:2056)
   * @maxItems 4
   * @minItems 4
   * @example [2683470,1247913,2683480,1247923]
   */
  bbox: number[];
  /**
   * SRID for query bbox (default: 2056)
   * @example 2056
   */
  srid?: number;
}

export type TopicsFeatureInfoDetailData = Feature;

export type GeneralInfoListData = General;

export type TopicsLegendDetailData = Legend;

export type MetadataDatasetsListData = MetadataDatasets;

export type MetadataDatasetsDetailData = MetadataDataset;

export interface MetadataGeoshopProductsListData {
  geoshop_products: {
    /** Geoshop product ID */
    giszhnr: number;
    /** Link auf Geodatashop bei NOGD-Daten */
    url_shop: string | null;
  }[];
}

export type MetadataMapsListData = MetadataMaps;

export type MetadataMapsDetailData = MetadataMap;

export type MetadataMapsDetail2Data = MetadataMap;

export type MetadataProductsListData = MetadataProducts;

export type MetadataProductsDetailData = MetadataProduct;

export type MetadataServicesListData = MetadataServices;

export type MetadataServicesDetailData = MetadataService;

export type UserFavoritesListData = PersonalFavorite[];

export type UserFavoritesCreateData = PersonalFavorite;

export type UserFavoritesDetailData = PersonalFavorite;

export type UserFavoritesDeleteData = any;

export type PrintCapabilitiesListData = PrintCapabilities;

export interface PrintCreateData {
  /** Link to report file */
  report_url: string;
}

export type PrintDetailData = any;

export type FavoritesListData = SharedFavorite[];

export type FavoritesCreateData = SharedFavorite;

export type FavoritesDetailData = SharedFavorite;

export type TopicsListData = Topics;
