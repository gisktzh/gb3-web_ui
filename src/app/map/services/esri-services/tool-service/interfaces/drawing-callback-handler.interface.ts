import Geometry from '@arcgis/core/geometry/Geometry';

export interface DrawingCallbackHandler {
  complete: (geometries: Geometry[]) => void;
}
