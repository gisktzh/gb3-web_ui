/**
 * Generated using https://transform.tools/json-to-typescript and the output from the endpoint.
 * There are some slight manual adjustments:
 * - The root object is renamed to include the endpoint name to avoid conflicts with other interface names
 * - The optional `image` in `FrequentlyUsed` is changed from `image?: Image` to `image: Image | null` to avoid errors
 */
/* eslint-disable */
/* tslint:disable */

export interface DiscoverMapsRoot {
  'discover-maps': Map[];
}

export interface Map {
  description: string;
  flex_id: string;
  from_date: string;
  id: string;
  image: Image;
  image_alt?: string;
  title: string;
  to_date: string;
}

export interface Image {
  name: string;
  path: string;
  size: number;
  type: string;
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

export interface FrequentlyUsedRoot {
  'frequently-used': FrequentlyUsed[];
}

export interface FrequentlyUsed {
  created: string;
  description: string;
  flex_id: string;
  image: Image | null;
  title: string;
  image_alt?: string;
  url?: string;
}
