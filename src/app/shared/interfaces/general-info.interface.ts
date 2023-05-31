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

export interface GeneralInfoResponse {
  locationInformation: LocationInformation;
  alternativeSpatialReferences: AlternativeSpatialReference[];
  externalMaps: ExternalMap[];
}
