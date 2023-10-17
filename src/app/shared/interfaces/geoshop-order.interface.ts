import {Polygon} from 'geojson';

type OrderPerimeter = 'direct' | 'indirect';
export type OrderSrs = 'lv95' | 'lv03';
type IndirectOrderLayerType = 'commune' | 'parcel';

interface AbstractOrder {
  email?: string;
  perimeterType: OrderPerimeter;
  products: Product[];
}

export interface DirectOrder extends AbstractOrder {
  perimeterType: 'direct';
  geometry: Polygon;
  srs: OrderSrs;
}

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
