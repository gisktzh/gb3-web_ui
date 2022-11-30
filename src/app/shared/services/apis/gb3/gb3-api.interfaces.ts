/**
 * Quick Hack: These interfaces are exported by using http://json2ts.com/ and then validating the properties using
 * https://www.npmjs.com/package/openapi-typescript
 *
 * Todo: Find a better way for exporting them :)
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
