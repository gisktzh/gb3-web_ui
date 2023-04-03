/**
 * Generated using http://json2ts.com/ and the output from the endpoint.
 */
/* eslint-disable */
/* tslint:disable */

export interface GravCmsRootObject {
  'discover-maps': Map[];
}

export interface Map {
  title: string;
  description: string;
  id: string;
  from_date: string;
  to_date: string;
  image: Image;
}

export interface Image {
  name: string;
  type: string;
  size: number;
  path: string;
}
