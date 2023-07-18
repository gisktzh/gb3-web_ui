import {MeasurementTool} from '../../shared/types/measurement-tool';
import {DrawingTool} from '../../shared/types/drawing-tool';

export interface ToolService {
  initializeMeasurement(measurementTool: MeasurementTool): void;

  initializeDrawing(drawingTool: DrawingTool): void;

  cancelTool(): void;
}
