import Graphic from '@arcgis/core/Graphic';

export interface DrawingCallbackHandler {
  complete: (geometries: Graphic[]) => void;
}
