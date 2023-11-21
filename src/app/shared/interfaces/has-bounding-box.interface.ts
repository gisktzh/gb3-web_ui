import {SupportedGeometry} from '../types/SupportedGeometry.type';

export interface HasBoundingBox {
  /** GeoJSON geometry object */
  boundingBox: SupportedGeometry;
}
