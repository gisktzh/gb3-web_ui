import Graphic from '@arcgis/core/Graphic';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';

export interface DrawingCallbackHandler {
  completeDrawing: (feature: Graphic, labelText?: string) => void;
  completeMeasurement: (feature: Graphic, labelPoint: Graphic, labelText: string) => void;
  completeSelection: (selection: DataDownloadSelection | undefined) => void;
}
