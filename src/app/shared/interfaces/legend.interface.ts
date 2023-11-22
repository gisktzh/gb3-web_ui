import {HasMetaDataLink} from './metaDataLink.interface';
import {SingleLayer} from './single-layer.interface';

export interface LayerClass {
  label: string;
  image: string;
}

export interface Layer extends HasMetaDataLink {
  layer: string;
  title: string;
  layerClasses?: LayerClass[];
  geolion?: number;
  attribution?: string;
}

export interface Legend extends HasMetaDataLink, SingleLayer {
  topic: string;
  layers: Layer[];
}

export interface LegendResponse {
  legend: Legend;
}

export interface LegendLayer extends Omit<Layer, 'geolion' | 'attribution'>, HasMetaDataLink {}

export interface LegendDisplay extends HasMetaDataLink, SingleLayer {
  id: string;
  title: string;
  icon?: string;
  layers: LegendLayer[];
  /**
   * The Topic ID in the API - used for printing as id might also be our internal single layer id.
   */
  mapId: string;
}
