interface AlternativeSpatialReference {
  coordinates: number[];
  crs: string;
}

interface ExternalMap {
  name: string;
  url: string;
}

interface LocationInformation {
  lv95x: number;
  lv95y: number;
  crs: string;
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
    /** JSON URL */
    jsonUrl: string;
    /** XML URL */
    xmlUrl: string;
    /** PDF URL */
    pdfUrl: string;
    /** GB2 Dynamic Extract URL */
    gb2Url: string;
  };
}

export interface GeneralInfoResponse {
  locationInformation: LocationInformation;
  alternativeSpatialReferences: AlternativeSpatialReference[];
  externalMaps: ExternalMap[];
  parcel?: Parcel;
}
