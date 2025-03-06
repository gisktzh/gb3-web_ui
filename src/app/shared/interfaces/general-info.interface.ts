import {PointWithSrs} from './geojson-types-with-srs.interface';

interface AlternativeSpatialReference {
  coordinates: number[];
  crs: string;
  name: string;
}

interface ExternalMap {
  name: string;
  url: string;
}

interface LocationInformation {
  queryPosition: PointWithSrs;
  heightDom: number;
  heightDtm: number;
}

interface Parcel {
  oerebExtract: {
    /** PDF URL */
    pdfUrl: string | null;
  };
  ownershipInformation: {
    url: string | null;
  };
}

export interface GeneralInfoResponse {
  locationInformation: LocationInformation;
  alternativeSpatialReferences: AlternativeSpatialReference[];
  externalMaps: ExternalMap[];
  parcel?: Parcel;
}
