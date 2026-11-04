/** Identifies the displayed map item, including items containing only a single layer. */
export type FeatureHighlightSource =
  | {
      sourceType: 'feature_info';
      mapItemId: string;
      layerName: string;
    }
  | {
      sourceType: 'oereb_extract';
      mapItemId: null;
      layerName: null;
    };

/** Scale denominators, rather than Esri's inversely named minScale/maxScale properties. */
export interface FeatureInfoScaleRange {
  minScale: number;
  maxScale: number;
}
