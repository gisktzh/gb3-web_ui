import Graphic from '@arcgis/core/Graphic';

export interface DrawingCallbackHandler {
  complete: (feature: Graphic, labelText?: string) => void;
}
