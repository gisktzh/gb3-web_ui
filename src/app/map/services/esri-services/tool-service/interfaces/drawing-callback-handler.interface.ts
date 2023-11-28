import Graphic from '@arcgis/core/Graphic';

export interface DrawingCallbackHandler {
  completeDrawing: (feature: Graphic, labelText?: string) => void;
  completeMeasurement: (feature: Graphic, labelPoint: Graphic, labelText: string) => void;
}
