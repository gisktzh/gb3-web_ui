export enum InternalDrawingLayer {
  FeatureHighlight = 'feature_highlight',
  FeatureQueryLocation = 'feature_query_location',
  LocatePosition = 'locate_position'
}

export enum UserDrawingLayer {
  Measurements = 'measurements'
}

/**
 * All layers which can be used to draw on them; may be internal or external.
 */
export type DrawingLayer = UserDrawingLayer | InternalDrawingLayer;
