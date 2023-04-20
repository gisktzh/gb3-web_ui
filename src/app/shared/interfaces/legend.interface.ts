interface LayerClass {
  label: string;
  image: string;
}

interface Layer {
  layer: string;
  title: string;
  layerClasses?: LayerClass[];
  geolion?: number;
  attribution?: string;
}

export interface Legend {
  topic: string;
  layers: Layer[];
}

export interface LegendResponse {
  legend: Legend;
}

export interface LegendDisplay {
  title: string;
  icon: string | undefined;
  layers: Layer[];
  isSingleLayer: boolean;
}
