/**
 * Generated using https://transform.tools/json-to-typescript and the output from the endpoint.
 */
/* eslint-disable */
/* tslint:disable */

export interface DiscoverMapsRoot {
  'discover-maps': Map[];
}

export interface Map {
  title: string;
  description: string;
  id: string;
  from_date: string;
  to_date: string;
  image: Image;
  flex_id: string;
}

export interface Image {
  name: string;
  type: string;
  size: number;
  path: string;
}

export interface PageInfosRoot {
  'page-infos': PageInfo[];
}

export interface PageInfo {
  title: string;
  description: string;
  pages: Pages;
  from_date: string;
  to_date: string;
  severity: string;
  flex_id: string;
}

export interface Pages {
  start: boolean;
  map: boolean;
  datacatalogue: boolean;
  support: boolean;
}

export interface MapInfosRoot {
  'map-infos': MapInfo[];
}

export interface MapInfo {
  title: string;
  description: string;
  topics: string[];
  from_date: string;
  to_date: string;
  flex_id: string;
}

export interface FrequentlyUsedRoot {
  'frequently-used': FrequentlyUsed[];
}

export interface FrequentlyUsed {
  title: string;
  description: string;
  url?: string;
  image?: Image;
  created: string;
  flex_id: string;
}
