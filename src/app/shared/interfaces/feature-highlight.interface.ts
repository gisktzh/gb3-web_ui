/** Identifies the displayed map item, including items containing only a single layer. */
export interface FeatureHighlightSource {
  mapItemId: string;
  layerName: string;
}

/** Scale denominators, rather than Esri's inversely named minScale/maxScale properties. */
export interface FeatureInfoScaleRange {
  minScale: number;
  maxScale: number;
}
