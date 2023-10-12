import {InternalDrawingRepresentation} from './internal-drawing-representation.interface';
import {DataDownloadSelectionTool} from '../types/data-download-selection-tool.type';

export interface DataDownloadSelection {
  drawingRepresentation: InternalDrawingRepresentation;
  type: DataDownloadSelectionTool;
}
