export enum InternalDrawingLayer {
  FeatureHighlight = 'feature_highlight',
  FeatureQueryLocation = 'feature_query_location',
  LocatePosition = 'locate_position',
  PrintPreview = 'print_preview',
}

export enum UserDrawingLayer {
  Measurements = 'measurements',
  Drawings = 'drawings',
}

/**
 * All layers which can be used to draw on them; may be internal or external.
 */
export type DrawingLayer = UserDrawingLayer | InternalDrawingLayer;
