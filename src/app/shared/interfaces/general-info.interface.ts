interface AlternativeSpatialReference {
  coordinates: number[];
  crs: string;
}

interface ExternalMap {
  name: string;
  url: string;
}

interface LocationInformation {
  spatialReference: {
    /** Coordinates */
    coordinates: number[];
    /** CRS */
    crs: string;
    /** Spatial Reference Name */
    name: string;
  };
  heightDom: number;
  heightDtm: number;
}

interface Parcel {
  /** BFS number */
  bfsnr: number;
  /** EGRIS egrid */
  egrisEgrid: string;
  /** Municipality name */
  municipalityName: string;
  oerebExtract: {
    /** PDF URL */
    pdfUrl: string;
  };
}

export interface GeneralInfoResponse {
  locationInformation: LocationInformation;
  alternativeSpatialReferences: AlternativeSpatialReference[];
  externalMaps: ExternalMap[];
  parcel?: Parcel;
}
