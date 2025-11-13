import Graphic from '@arcgis/core/Graphic';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';
import {DrawingMode} from '../types/drawing-mode.type';
import {MapDrawingSymbol} from '../../types/map-drawing-symbol.type';

export interface DrawingCallbackHandler {
  completeDrawing: (
    feature: Graphic,
    mode: DrawingMode,
    labelText?: string,
    mapDrawingSymbol?: MapDrawingSymbol,
    symbolSize?: number,
    symbolRotation?: number,
  ) => void;
  completeMeasurement: (feature: Graphic, labelPoint: Graphic, labelText: string, mode: DrawingMode) => void;
  completeSelection: (selection: DataDownloadSelection | undefined) => void;
}
