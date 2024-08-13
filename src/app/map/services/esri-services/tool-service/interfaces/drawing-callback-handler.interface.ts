import Graphic from '@arcgis/core/Graphic';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';
import {DrawingMode} from '../types/drawing-mode.type';

export interface DrawingCallbackHandler {
  completeDrawing: (feature: Graphic, mode: DrawingMode, labelText?: string) => void;
  completeMeasurement: (feature: Graphic, labelPoint: Graphic, labelText: string, mode: DrawingMode) => void;
  completeSelection: (selection: DataDownloadSelection | undefined) => void;
}
