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

import {SupportedEsriTool} from '../../map/services/esri-services/tool-service/strategies/supported-esri-tool.type';

export interface Canton {
  /** GeoJSON geometry object */
  boundingbox: Geometry;
}

/**
 * Error objects provide additional information about problems encountered while performing an operation.
 * Error objects MUST be returned as an array keyed by errors in the top level of a JSON:API document.
 *
 * An error object MAY have the following members, and MUST contain at least one of:
 * - id
 * - links
 * - status
 * - code
 * - title
 * - detail
 * - source
 * - meta
 */
export interface ErrorObject {
  /** A unique identifier for this particular occurrence of the problem. */
  id?: string;
  /** A links object containing the following members: about, type */
  links?: {
    /** A link that leads to further details about this particular occurrence of the problem. When dereferenced, it should lead to a human-readable explanation of the error. */
    about?: LinkObject;
    /** A link that identifies the type of error that this particular error is an instance of. This URI SHOULD be dereferencable to a human-readable explanation of the general error. */
    type?: LinkObject;
  };
  /** The HTTP status code applicable to this problem, expressed as a string value. */
  status?: string;
  /** An application-specific error code, expressed as a string value. */
  code?: string;
  /** A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem, except for purposes of localization. */
  title?: string;
  /** A human-readable explanation specific to this occurrence of the problem. Like title, this field’s value can be localized. */
  detail?: string;
  /** An object containing references to the source of the error, optionally including any of the following members: pointer, parameter, header */
  source?: {
    /** A JSON Pointer https://tools.ietf.org/html/rfc6901 to the associated entity in the request document [e.g. "/data" for a primary data object, or "/data/attributes/title" for a specific attribute]. */
    pointer?: string;
    /** A string indicating which URI query parameter caused the error. */
    parameter?: string;
    /** A string indicating which HTTP header caused the error. */
    header?: string;
  };
  /** A meta object containing non-standard meta-information about the error. */
  meta?: {
    /** Can be any value - string, number, boolean, array or object. */
    AnyValue?: any;
  };
}

export interface ErrorResponse {
  errors: ErrorObject[];
}

export interface Feature {
  feature_info: {
    query_position: QueryCoordinates;
    results: {
      /** Topic name */
      topic: string;
      /** Geolion ID of topic */
      geolion_gdd: number | null;
      /** UUID from geometadatabase */
      geolion_karten_uuid: string | null;
      layers: {
        /** Layer name (layer info only) */
        layer: string;
        /** Layer or topic info title */
        title: string;
        /** Geolion ID of layer (layer info only) */
        geolion_gds?: number | null;
        /** UUID from geometadatabase (layer info only) */
        geolion_geodatensatz_uuid?: string | null;
        features: {
          /** Feature ID (layer info only) */
          fid: number;
          /** Feature fields */
          fields: InfoFeatureField[];
          /** Feature geometry (layer info only) */
          geometry?: Geometry;
        }[];
      }[];
    };
  };
}

export interface General {
  general_info: {
    query_position: QueryCoordinates;
    /** Height above sea level (Digitales Oberflächenmodell) */
    height_dom: number;
    /** Height above sea level (Digitales Terrainmodell) */
    height_dtm: number;
    /** Alternative spatial references */
    spatial_references: {
      /** Coordinates */
      coordinates: number[];
      /** CRS */
      crs: string;
      /** Spatial Reference Name */
      name: string;
    }[];
    /** External maps */
    external_maps: LinkObject[];
    parcel: {
      /** BFS number */
      bfsnr: number;
      /** EGRIS egrid */
      egris_egrid: string;
      /** Municipality name */
      municipality_name: string;
      oereb_extract: LinkObject;
      owner: LinkObject;
    } | null;
  };
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

export interface MetadataDataset {
  dataset: Dataset;
}

export interface MetadataDatasets {
  datasets: Dataset[];
}

export interface MetadataGeoshopProducts {
  geoshop_products?: {
    /** Geoshop product ID */
    giszhnr: number;
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

export interface MetadataProduct {
  product: Product;
}

export interface MetadataProducts {
  products: Product[];
}

export interface MetadataService {
  service: Service;
}

export interface MetadataServices {
  services: Service[];
}

export interface MunicipalitiesList {
  /**
   * Timestamp of the data
   * @example "2020-01-01T00:00:00+00:00"
   */
  timestamp: string | null;
  /** List of municipalities */
  municipalities: MunicipalityItem[];
}

export interface Municipality {
  /**
   * Timestamp of the data
   * @example "2020-01-01T00:00:00+00:00"
   */
  timestamp: string | null;
  municipality: {
    /** Municipality BFS number */
    bfs_no: number;
    /** Municipality name */
    name: string;
    /** GeoJSON geometry object */
    boundingbox: Geometry;
  };
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
  content: FavoriteContent;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
}

export type PrintFeatureInfoNew = {
  /** List of query topics */
  query_topics?: {
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
   * X coordinate of query
   * @example 2683475
   */
  x?: number;
  /**
   * Y coordinate of query
   * @example 1247918
   */
  y?: number;
  /**
   * Query bounding box as minx, miny, maxx, maxy coords (default in EPSG:2056)
   * @maxItems 4
   * @minItems 4
   * @example [2683470,1247913,2683480,1247923]
   */
  bbox?: number[];
  /**
   * SRID for query bbox (default: 2056)
   * @example 2056
   */
  srid?: number;
};

export interface PrintLegendNew {
  /** List of legend topics */
  legend_topics: {
    /**
     * Topic name
     * @example "BASISKARTEZH"
     */
    topic: string;
    /**
     * Legend layers
     * @example ["gemeindegrenzen","adressen","haltestellen"]
     */
    layers: string[];
  }[];
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
           * WMS layer names ordered from bottom to top
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

export interface PrintReport {
  /** Link to report file */
  report_url: string;
}

export interface ProductsList {
  /** Timestamp of product list in ISO8601 format */
  timestamp: string;
  products: ProductItem[];
}

export interface RelevantProductsList {
  /** Timestamp of product list in ISO8601 format */
  timestamp: string | null;
  /** List of relevant products' IDs */
  products: string[];
}

export type SearchResultsList = {
  index: string;
  matches: (SearchMatch | MetaSearchMatch)[];
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
  content: FavoriteContent;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
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
          /** a list containing the values to be filtered */
          values: (string | number)[];
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
      /**
       * Map opacity. Value 1.0 means no transparency, value 0.0 corresponds to full transparency.
       * @format float
       * @min 0
       * @max 1
       */
      opacity: number;
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

/** Kontaktdaten */
export interface Contact {
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
  email: LinkObject | null;
  /** URL */
  weburl: LinkObject | null;
}

export interface Dataset {
  /** UUID */
  uuid: string;
  /** Link auf Bild */
  image_url: string | null;
  /** Verfügbarkeit OGD/NOGD */
  ogd: boolean;
  /** Kontakt: Verantwortlich für Geodaten */
  kontakt_geodaten: Contact;
  /** Kontakt: Zuständig für Geometadaten */
  kontakt_metadaten: Contact;
  /** Dataset GIS-ZH-Nummer */
  giszhnr: number;
  /** Name des Geodatensatzes */
  name: string;
  /** Kurzbeschreibung */
  kurzbeschreibung: string;
  /** Beschreibung */
  beschreibung: string;
  /** eCH Geokategorien / Themen */
  themen: string[];
  /** Schlüsselwörter */
  keywords: string[] | null;
  /** Geodaten aktueller Stand (dd.mm.YYYY) */
  datenstand: string | null;
  /** Nachführungstyp */
  nachfuehrungstyp: string | null;
  /** Bearbeitungsstatus */
  bearbeitungstatus: string | null;
  /** Geographisches Gebiet / Ausdehnung */
  geogausdehnung: string | null;
  /** Erfassungsmassstab */
  erfassungsmasstab: number | null;
  /** Auflösung */
  aufloesung: number | null;
  /** Lagegenauigkeit */
  lagegenauigkeit: number | null;
  /** Geobasisdaten-Klasse */
  gesetzklasse: string | null;
  /** Link auf Geobasisdaten */
  geobasisdaten: LinkObject | null;
  /** Link auf Geodatashop bei NOGD-Daten */
  url_shop: LinkObject | null;
  /** Abgabeformate */
  abgabeformate: string[];
  /** Datenerfassung */
  datenerfassung: string | null;
  /** Datengrundlage */
  datengrundlage: string | null;
  /** Dokumentation (HTML) */
  documentationhtml: LinkObject | null;
  /** Link auf Dokumentation (PDF) */
  pdf: LinkObject | null;
  /** Bemerkungen */
  bemerkungen: string | null;
  /** Link auf Geocat */
  geocat: LinkObject | null;
  /** Link auf OpendataSwiss */
  opendataswiss: LinkObject | null;
  /** Link auf ArcMap .mxd */
  mxd: LinkObject | null;
  /** Links auf ArcMap .lyr */
  lyrs: LinkObject[];
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
    /** Layername */
    name: string;
    /** Layer GIS-ZH-Nummer */
    giszhnr: string;
    /** Beschreibung des Layers */
    beschreibung: string;
    /** Geometrietyp */
    geometrietyp: string;
    /** Pfad\Filename */
    pfadfilename: string | null;
    /** Metadaten Sichtbarkeit */
    metadaten_sichtbarkeit: string;
    /** Datenbezugart */
    datenbezugart: string;
    attribute: {
      /** Attributname */
      name: string | null;
      /** Attributtyp */
      typ: string | null;
      /** Einheit des Attributwerts */
      einheit: string | null;
      /** Beschreibung des Attributs */
      beschreibung: string | null;
    }[];
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

export type FavoriteContent = {
  /** ID of the map */
  id: string;
  /** ID of the map */
  mapId: string;
  /** Visibility of the map */
  visible: boolean;
  /**
   * Map opacity. Value 1.0 means no transparency, value 0.0 corresponds to full transparency.
   * @format float
   * @min 0
   * @max 1
   */
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
  attributeFilters?: {
    /** Filter parameter name */
    parameter: string;
    /** Filter title */
    name: string;
    activeFilters: {
      /** Filter item name */
      name: string;
      /** Filter item checked */
      isActive: boolean;
    }[];
  }[];
  /** Time extent of the map */
  timeExtent?: {
    /** Start of time extent */
    start: string;
    /** End of time extent */
    end: string;
  };
}[];

export type FavoriteDrawings = VectorLayer;

export type FavoriteMeasurements = VectorLayer;

export interface GenericGeojsonFeature {
  /** GeoJSON Feature */
  type: 'Feature';
  /** Feature properties */
  properties: object | null;
  /** GeoJSON geometry object */
  geometry: Geometry;
}

/**
 * GeoJSON FeatureCollection
 * @example {"type":"FeatureCollection","features":[{"type":"Feature","properties":{},"geometry":{"type":"Point","coordinates":[8.5438572,47.3780431]}}]}
 */
export interface GenericGeojsonFeatureCollection {
  /** GeoJSON FeatureCollection */
  type: 'FeatureCollection';
  features: GenericGeojsonFeature[];
}

export interface GeojsonFeature {
  /** GeoJSON Feature */
  type: 'Feature';
  properties: {
    /**
     * UUID of the given feature
     */
    id: string; // todo: specify API interface to expect these properties; see https://jira-geo.zh.ch/browse/GB3-825
    /**
     * UUID if the feature has a belongsTo relationship with another feature, e.g. the label of a measurement.
     */
    belongsTo?: string; // todo: specify API interface to expect these properties; see https://jira-geo.zh.ch/browse/GB3-825
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
    /**
     * The tool used to draw the feature
     * @example "polygon"
     */
    tool: SupportedEsriTool; // todo: specify API interface to expect these properties; see https://jira-geo.zh.ch/browse/GB3-825
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

/** GeoJSON geometry object */
export interface Geometry {
  /**
   * Type of GeoJSON geometry object
   * @example "Polygon"
   */
  type: 'Polygon' | 'Point' | 'LineString' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon';
  crs?: GeometryCrs;
  /**
   * coordinates for GeoJSON geometry object
   * @example [[[2681730,1247976],[2680217,1249161],[2680809,1250249],[2681937,1249504],[2681730,1247976]],[[2680836,1249355],[2681554,1249477],[2681327,1248867],[2680836,1249355]]]
   */
  coordinates: (number | number[] | number[][] | number[][][])[];
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

/** Image source path and meta data */
export interface Image {
  /** Source path of the image file for rendering e.g. as thumbnail */
  src: LinkObject;
  /** Alternative text of the image for accessiblity purposes */
  alt: string;
  /** Link to the original image file */
  url: LinkObject;
}

/** Feature field */
export type InfoFeatureField =
  | {
      /** Field label */
      label: string;
      /** Field value (string, numeric or null) */
      value: string | number | null;
      /** type for the link object */
      type: string;
    }
  | {
      /** Field label */
      label: string;
      /** Field link */
      value: LinkObject;
      /** type for the link object */
      type: string;
    }
  | {
      /** Field label */
      label: string;
      /** Field image */
      value: Image;
      /** type for the image object */
      type: string;
    };

/** A link MUST be represented as either: a string containing the link’s URL or a link object. */
export type Link = LinkObject | string | null;

export interface LinkObject {
  /** A string whose value is a URI-reference https://datatracker.ietf.org/doc/html/rfc3986#section-4.1 pointing to the link’s target. */
  href: string;
  /** A string indicating the link’s relation type. The string MUST be a valid link relation type. */
  rel?: string;
  /** A link that leads to further information about this link. */
  describedby?: LinkObject;
  /** A string containing a human-readable description of the link. */
  title?: string;
  /** A string or an array of strings indicating the language(s) of the link’s target. An array of strings indicates that the link’s target is available in multiple languages. Each string MUST be a valid language tag https://datatracker.ietf.org/doc/html/rfc5646. */
  hreflang?: string;
  /** A meta object containing non-standard meta-information about the link. */
  meta?: object;
}

export interface Map {
  /** Map UUID */
  uuid: string;
  /** Link auf Bild */
  image_url: string | null;
  /** Kontakt: Verantwortlich für Geodaten */
  kontakt_geodaten: Contact;
  /** Map GB2-Nummer */
  gb2_id: number;
  /** Topic name */
  topic: string;
  /** Kartenname */
  name: string;
  /** Beschreibung der Karte */
  beschreibung: string;
  /** Link to the internet version of the current map */
  gbkarten_internet_url: LinkObject | null;
  /** Link to the intranet version of the current map (only available whether this api is called from intranet) */
  gbkarten_intranet_url: LinkObject | null;
  /** Link auf GB2-Karte */
  gb2_url: LinkObject | null;
  /** Links auf weiterführende Verweise */
  verweise: LinkObject[];
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
    url_shop: LinkObject | null;
  }[];
}

export interface MetaSearchMatch {
  /**
   * UUID of the meta object
   * @format uuid
   * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$
   */
  uuid: string;
  /** Score of the match */
  score: number;
}

export interface MunicipalityItem {
  /** Municipality BFS number */
  bfs_no: number;
  /** Municipality name */
  name: string;
}

export interface Product {
  /** Product UUID */
  uuid: string;
  /** Link auf Bild */
  image_url: string | null;
  /** Kontakt: Zuständig für Geometadaten */
  kontakt_metadaten: Contact;
  /** Product GDP-Nummer */
  gdpnummer: number;
  /** Name des Geodatenprodukts */
  name: string;
  /** Beschreibung des Geoproduktes */
  beschreibung: string;
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
    url_shop: LinkObject | null;
  }[];
}

export interface ProductItem {
  /** Geolion Geodatensatz UUID foreign key */
  geolion_geodatensatz_uuid: string | null;
  /** Product ID */
  id: string;
  /** Product GISZHNR */
  giszhnr: number;
  /** Product OGD flag */
  ogd: boolean;
  /** Product name */
  name: string;
  /** Product keywords */
  keywords: string[] | null;
  /** Product themes */
  themes: string[] | null;
  /** Available Product formats */
  formats: {
    /** Format ID */
    id: number;
    /** Format description */
    description: string;
    /**
     * MB per km2 median
     * @format float
     */
    mb_per_km2_med: number | null;
    /** Fixed size flag */
    is_fixed_size: boolean | null;
  }[];
  /** Product URL for non-OGD products */
  url: string | null;
}

export interface QueryCoordinates {
  /** LV95 X coordinate of center of query bbox */
  x: number;
  /** LV95 Y coordinate of center of query bbox */
  y: number;
  /** SRID of x/y point */
  srid: number;
}

export interface SearchMatch {
  /** Display string of the match */
  displayString: string;
  /** Score of the match */
  score: number;
  /** Geometry of the match */
  geometry?: Geometry;
}

export interface Service {
  /** Service UUID */
  uuid: string;
  /** Link auf Bild */
  image_url: string | null;
  /** Kontakt: Zuständig für Geometadaten */
  kontakt_metadaten: Contact;
  /** Service GDSer-Nummer */
  gdsernummer: number;
  /** Servicetyp, z.B. WMS, WFS */
  servicetyp: string;
  /** Name des Geodienstes */
  name: string;
  /** Beschreibung des Geodienstes */
  beschreibung: string;
  /** URL */
  url: LinkObject;
  /** Version */
  version: string;
  /** Zugang */
  zugang: string;
  /** Link auf Geocat */
  geocat: LinkObject | null;
  /** Link auf OpendataSwiss */
  opendataswiss: LinkObject | null;
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
    url_shop: LinkObject | null;
  }[];
}

export interface VectorInputGeneral {
  /** GeoJSON file containing FeatureCollection or Feature, or KML file */
  file: File;
}

export interface VectorInputGeojson {
  /** GeoJSON file containing FeatureCollection or Feature */
  file: File;
}

export interface VectorInputKml {
  /** KML file */
  file: File;
}

/** Vector layer */
export interface VectorLayer {
  /** Vector layer type */
  type: 'Vector';
  /** GeoJSON FeatureCollection */
  geojson: GeojsonFeatureCollection;
  /** Style definitions for features. NOTE: keys are style IDs referenced in feature 'style' property */
  styles: VectorLayerStyles;
}

/**
 * Style definitions for features. NOTE: keys are style IDs referenced in feature 'style' property
 * @example {"a":{"pointRadius":15,"fillColor":"#ee3333","fillOpacity":0,"strokeColor":"#ee3333","strokeWidth":3,"type":"point"}}
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
    /** Geometry type of the drawing (point, line, polygon or text) */
    type?: 'point' | 'line' | 'polygon' | 'text';
  };
};

/** Vector layer without styles */
export interface VectorLayerWithoutStyles {
  /** Vector layer type */
  type: 'Vector';
  /** GeoJSON FeatureCollection */
  geojson: GenericGeojsonFeatureCollection;
  /** Style definitions for features. NOTE: keys are style IDs referenced in feature 'style' property */
  styles?: VectorLayerStyles;
}

export type CantonListData = Canton;

export type ImportGeojsonCreateData = VectorLayer;

export type ExportGeojsonCreateData = GenericGeojsonFeatureCollection;

export type ImportCreateData = VectorLayer;

export type ImportKmlCreateData = VectorLayer;

export type ExportKmlCreateData = any;

export type TopicsFeatureInfoDetailData = Feature;

export type GeneralInfoListData = General;

export type TopicsLegendDetailData = Legend;

export type MetadataDatasetsListData = MetadataDatasets;

export type MetadataDatasetsDetailData = MetadataDataset;

export type MetadataGeoshopProductsListData = MetadataGeoshopProducts;

export type MetadataMapsListData = MetadataMaps;

export type MetadataMapsDetailData = MetadataMap;

export type MetadataProductsListData = MetadataProducts;

export type MetadataProductsDetailData = MetadataProduct;

export type MetadataServicesListData = MetadataServices;

export type MetadataServicesDetailData = MetadataService;

export type MunicipalitiesListData = MunicipalitiesList;

export type MunicipalitiesDetailData = Municipality;

export type UserFavoritesListData = PersonalFavorite[];

export type UserFavoritesCreateData = PersonalFavorite;

export type UserFavoritesDetailData = PersonalFavorite;

export type UserFavoritesDeleteData = any;

export type PrintCreateData = PrintReport;

export type PrintFeatureInfoCreateData = PrintReport;

export type PrintLegendCreateData = PrintReport;

export type PrintDetailData = any;

export type ProductsRelevantListData = RelevantProductsList;

export type ProductsListData = ProductsList;

export type SearchListData = SearchResultsList;

export type FavoritesListData = SharedFavorite[];

export type FavoritesCreateData = SharedFavorite;

export type FavoritesDetailData = SharedFavorite;

export type TopicsListData = Topics;
