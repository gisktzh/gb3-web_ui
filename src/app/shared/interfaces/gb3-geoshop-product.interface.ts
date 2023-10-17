import {SupportedGeometry} from '../types/SupportedGeometry.type';

export interface ProductsList {
  /** Timestamp of product list in ISO8601 format */
  timestamp: string;
  products: Product[];
  municipalities: Municipality[];
}

export interface Municipality {
  /** Municipality BFS number */
  bfsNo: number;
  /** Municipality name */
  name: string;
  /** GeoJSON geometry object */
  boundingbox: SupportedGeometry;
}

export interface Product {
  /** Product ID */
  id: string;
  /** Product GISZHNR */
  giszhnr: number;
  /** Product name */
  name: string;
  /** Product type */
  type: 'Vektor' | 'Raster';
  /** Product keywords as comma-separated list */
  keywords: string | null;
  /** Product themes as comma-separated list */
  themes: string | null;
  /** Product description */
  description: string;
  /** Product OGD flag */
  ogd: boolean;
  /** Product URL for non-OGD products */
  nonOgdProductUrl: string | null;
  /** Available Product formats */
  formats: {
    /** Format ID */
    id: number;
    /** Format description */
    description: string;
  }[];
}
