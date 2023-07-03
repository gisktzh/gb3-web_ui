import {MeasurementTool} from '../../state/map/states/tool.state';

export interface ToolService {
  startMeasurement(measurementTool: MeasurementTool): void;
}
