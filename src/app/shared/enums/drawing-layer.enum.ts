export enum InternalDrawingLayer {
  FeatureHighlight = 'feature_highlight',
  FeatureQueryLocation = 'feature_query_location',
  LocatePosition = 'locate_position',
  PrintPreview = 'print_preview',
  Selection = 'selection',
  ElevationProfile = 'elevation_profile',
  SearchResultHighlight = 'search_result_highlight',
}

export enum UserDrawingLayer {
  Measurements = 'measurements',
  Drawings = 'drawings',
}

export enum DrawingLayerPrefix {
  Drawing = 'USER_DRAWING__',
  Internal = 'INTERNAL__',
}

/**
 * All layers which can be used to draw on them; may be internal or external.
 */
export type DrawingLayer = UserDrawingLayer | InternalDrawingLayer;
