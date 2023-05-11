interface HasMetaDataLink {
  metaDataLink?: string;
}

interface LayerClass {
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

export interface Legend extends HasMetaDataLink {
  topic: string;
  layers: Layer[];
}

export interface LegendResponse {
  legend: Legend;
}

export interface LegendLayer extends Omit<Layer, 'geolion' | 'attribution'>, HasMetaDataLink {}

export interface LegendDisplay extends HasMetaDataLink {
  id: string;
  title: string;
  icon?: string;
  layers: LegendLayer[];
  isSingleLayer: boolean;
  metaDataLink?: string;
}
