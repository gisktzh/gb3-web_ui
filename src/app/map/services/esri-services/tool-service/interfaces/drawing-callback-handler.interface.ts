import Graphic from '@arcgis/core/Graphic';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';

export interface DrawingCallbackHandler {
  completeDrawing: (feature: Graphic, mode: DrawingMode, labelText?: string) => void;
  completeMeasurement: (feature: Graphic, labelPoint: Graphic, labelText: string, mode: DrawingMode) => void;
  completeSelection: (selection: DataDownloadSelection | undefined) => void;
}

export type DrawingMode = 'add' | 'edit' | 'delete';
