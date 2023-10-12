import {MeasurementTool} from '../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../shared/types/drawing-tool.type';
import {DataDownloadSelectionTool} from '../../shared/types/data-download-selection-tool.type';

export interface ToolService {
  initializeMeasurement(measurementTool: MeasurementTool): void;

  initializeDrawing(drawingTool: DrawingTool): void;

  initializeDataDownloadSelection(selectionTool: DataDownloadSelectionTool): void;

  cancelTool(): void;
}
