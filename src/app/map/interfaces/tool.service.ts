import {MeasurementTool} from '../../shared/types/measurement-tool';

export interface ToolService {
  startMeasurement(measurementTool: MeasurementTool): void;

  cancelMeasurement(): void;
}
