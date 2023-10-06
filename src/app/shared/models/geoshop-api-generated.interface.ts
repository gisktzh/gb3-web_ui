/**
 * Generated once using https://transform.tools/json-to-typescript and the official documentation PDF https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/planen-bauen/geoinformation/geodaten/geodatenshop/rest_schnittstelle_ogd_interface.pdf
 * and heavily enriched with type information from the documentation.
 */

export interface Products {
  timestamp: string;
  formats: ProductsFormat[];
  products: ProductsProduct[];
  communes: ProductsCommune[];
}

interface ProductsFormat {
  id: number;
  name: string;
}

interface ProductsProduct {
  id: number;
  name: string;
  description: string;
  type: string;
  formats: number[];
}

interface ProductsCommune {
  id: string;
  name: string;
}

interface AbstractOrder {
  email: string;
  perimeter_type: 'DIRECT' | 'INDIRECT';
  products: OrderProduct[];
}

export type Coordsys = 'LV95' | 'LV03';

interface DirectOrder extends AbstractOrder {
  perimeter_type: 'DIRECT';
  pdir_polygon: OrderPdirPolygon;
  pdir_coordsys: Coordsys;
}

export type LayerName = 'COMMUNE' | 'PARCEL';

interface IndirectOrder extends AbstractOrder {
  perimeter_type: 'INDIRECT';
  pindir_layer_name: LayerName;
  pindir_ident: string[];
}

export type Order = DirectOrder | IndirectOrder;

interface OrderPdirPolygon {
  type: string;
  coordinates: number[][][];
}

interface OrderProduct {
  product_id: number;
  format_id: number;
}

export interface OrderResponse {
  download_url: string;
  order_id: string;
  status_url: string;
  timestamp: string;
}

export interface OrderStatus {
  finished: string;
  internal_id: number;
  order: Order;
  order_id: string;
  /**
   * From the documentation:
   * For programmatic interpretation of the status codes, use the following rule: if a colon exists, extract the
   * substring before the colon, otherwise the whole string. The extracted string is to be considered as a
   * value of an enumeration set.
   */
  status: string;
  submitted: string;
}
