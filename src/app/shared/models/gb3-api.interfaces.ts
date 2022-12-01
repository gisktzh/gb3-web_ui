/**
 * These internal models should be used when accessing API responses.
 */
interface LayerClass {
  label: string;
  image: string;
}

interface Layer {
  title: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  layer_classes?: LayerClass[];
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
