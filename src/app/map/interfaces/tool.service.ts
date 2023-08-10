import {MeasurementTool} from '../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../shared/types/drawing-tool.type';

export interface ToolService {
  initializeMeasurement(measurementTool: MeasurementTool): void;

  initializeDrawing(drawingTool: DrawingTool): void;

  cancelTool(): void;
}
