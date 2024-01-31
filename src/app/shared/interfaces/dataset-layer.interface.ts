import {LayerAttributes} from './layer-attributes.interface';

export interface DatasetLayer {
  id: string;
  name: string;
  description: string;
  dataProcurementType: string;
  path: string | null;
  geometryType: string;
  attributes: LayerAttributes[];
  metadataVisibility: string;
}
