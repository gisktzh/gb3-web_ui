/**
 * Generated using http://json2ts.com/ and the output from the endpoint.
 */
export interface ContactPoint {
  org: string;
  orgUnit: string;
  email: string;
}

export interface Relation {
  name?: any;
  link?: any;
}

export interface Distribution {
  title: string;
  description: string;
  issued: Date;
  modified: Date;
  language: string;
  accessUrl: string;
  downloadUrl: string;
  rights: string;
  byteSize?: any;
  mediaType?: any;
  format: string;
}

export interface Dataset {
  identifier: string;
  title: string;
  description: string;
  issued: Date;
  modified: Date;
  publisher: string;
  contactPoint: ContactPoint;
  theme: string[];
  relation: Relation[];
  keyword: string[];
  landingPage: string;
  startDate?: any;
  endDate?: any;
  accrualPeriodicity: string;
  seeAlso: any[];
  distribution: Distribution[];
}

export interface RootObject {
  dataset: Dataset[];
}
