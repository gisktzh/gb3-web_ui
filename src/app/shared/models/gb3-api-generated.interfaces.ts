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

export type FavoriteDrawings = {
  /** Type of GeoJSON object */
  type: string;
  /** GeoJSON geometry object */
  geometry: {
    /** Type of GeoJSON geometry object */
    type: string;
    /** coordinates for drawings */
    coordinates: (number | number[])[];
  };
  /** GeoJSON properties object */
  properties: {
    style: {
      /** Fill color of the drawing */
      fillColor: string | null;
      /** Fill opacity of the drawing */
      fillOpacity: number | null;
      /** Rotation of the drawing */
      rotation: string | null;
      /** External graphic of the drawing */
      externalGraphic: string | null;
      /** Graphic name of the drawing */
      graphicName: string | null;
      /** Graphic opacity of the drawing */
      graphicOpacity: number | null;
      /** Point radius of the drawing */
      pointRadius: number | null;
      /** Stroke color of the drawing */
      strokeColor: string | null;
      /** Stroke opacity of the drawing */
      strokeOpacity: number | null;
      /** Stroke width of the drawing */
      strokeWidth: number | null;
      /** Stroke linecap of the drawing */
      strokeLinecap: string | null;
      /** Stroke linejoin of the drawing */
      strokeLinejoin: string | null;
      /** Stroke dashstyle of the drawing */
      strokeDashstyle: string | null;
      /** Font color of the drawing */
      fontColor: string | null;
      /** Font family of the drawing */
      fontFamily: string | null;
      /** Font size of the drawing */
      fontSize: string | null;
      /** Font style of the drawing */
      fontStyle: string | null;
      /** Font weight of the drawing */
      fontWeight: string | null;
      /** Halo color of the drawing */
      haloColor: string | null;
      /** Halo opacity of the drawing */
      haloOpacity: string | null;
      /** Halo radius of the drawing */
      haloRadius: string | null;
      /** Label of the drawing */
      label: string | null;
      /** Label align of the drawing */
      labelAlign: string | null;
      /** Label rotation of the drawing */
      labelRotation: string | null;
      /** Label X offset of the drawing */
      labelXOffset: string | null;
      /** Label Y offset of the drawing */
      labelYOffset: string | null;
    };
  };
}[];

export type FavoriteMeasurements = {
  /** Type of GeoJSON object */
  type: string;
  /** GeoJSON geometry object */
  geometry: {
    /** Type of GeoJSON geometry object */
    type: string;
    /** coordinates for measurements */
    coordinates: (number | number[])[];
  };
  /** properties of measurements */
  properties: {
    /** label for measurements */
    label: {
      /** text for label */
      text: string;
      /** coordinates for label */
      coordinates: (number | number[])[];
    };
  };
}[];

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
  /** LV95 East coordinate of the favorite */
  east: number;
  /** LV95 North coordinate of the favorite */
  north: number;
  /** Scale denominator of the favorite */
  scaledenom: number;
  /** Basemap of the favorite */
  basemap: string;
  content: FavoriteContent;
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
  /** LV95 East coordinate of the favorite */
  east: number;
  /** LV95 North coordinate of the favorite */
  north: number;
  /** Scale denominator of the favorite */
  scaledenom: number;
  /** Basemap of the favorite */
  basemap: string;
  content: FavoriteContent;
  drawings: FavoriteDrawings;
  measurements: FavoriteMeasurements;
}

export interface Legend {
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

export interface Feature {
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
            coordinates: (number | number[] | number[][][])[];
          };
        }[];
      }[];
    };
  };
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
      guid: number | null;
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
        guid: number | null;
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

export interface Print {
  /** print job creation endpoint URL */
  createURL: string;
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

export interface PrintNew {
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

export type InfoJsonListData = Print;

export interface CreateCreateData {
  /** print document retrieval endpoint URL */
  getURL: string;
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

export type MetadataProductsListData = MetadataProducts;

export type MetadataProductsDetailData = MetadataProduct;

export type MetadataServicesListData = MetadataServices;

export type MetadataServicesDetailData = MetadataService;

export type UserFavoritesListData = PersonalFavorite[];

export type UserFavoritesCreateData = any;

export type UserFavoritesDetailData = PersonalFavorite;

export type UserFavoritesDeleteData = any;

export type FavoritesListData = SharedFavorite[];

export type FavoritesCreateData = any;

export type FavoritesDetailData = SharedFavorite;

export type TopicsListData = Topics;
