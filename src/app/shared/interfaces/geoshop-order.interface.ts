import {Polygon} from 'geojson';

type OrderPerimeter = 'direct' | 'indirect';
export type OrderSrs = 'lv95' | 'lv03';
type IndirectOrderLayerType = 'commune' | 'parcel';

interface AbstractOrder {
  email?: string;
  perimeterType: OrderPerimeter;
  products: Product[];
}

/**
 * This interface is about direct orders.
 * Direct orders are using a geometry to select the area which will be downloaded.
 */
export interface DirectOrder extends AbstractOrder {
  perimeterType: 'direct';
  geometry: Polygon;
  srs: OrderSrs;
}

/**
 * This interface is about indirect orders.
 * Indirect orders are using unique identifiers to select the area(s) which will be downloaded.
 */
export interface IndirectOrder extends AbstractOrder {
  perimeterType: 'indirect';
  layerName: IndirectOrderLayerType;
  identifiers: string[];
}

export type Order = DirectOrder | IndirectOrder;

export interface Product {
  id: number;
  formatId: number;
}

export interface OrderResponse {
  downloadUrl: string;
  orderId: string;
  statusUrl: string;
  timestampDateString: string;
}
