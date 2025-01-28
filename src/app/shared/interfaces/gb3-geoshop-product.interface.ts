import {HasBoundingBox} from './has-bounding-box.interface';

export interface Municipality {
  /** Municipality BFS number */
  bfsNo: number;
  /** Municipality name */
  name: string;
}

export type BoundingBoxWithGeometry = HasBoundingBox;
export type MunicipalityWithGeometry = Municipality & HasBoundingBox;

export interface Product {
  /** Product ID */
  id: string;
  /** Product GISZHNR */
  gisZHNr: number;
  /** Product OGD flag */
  ogd: boolean;
  /** Product name */
  name: string;
  /** Product keywords */
  keywords: string[];
  /** Product themes */
  themes: string[];
  /** Available Product formats */
  formats: ProductFormat[];
  /** Geolion Geodatensatz UUID foreign key */
  geolionGeodatensatzUuid?: string;
  /** Product URL for non-OGD products */
  nonOgdProductUrl?: string;
}

export interface ProductFormat {
  /** Format ID */
  id: number;
  /** Format description */
  description: string;
}
