import {MeasurementTool} from '../../state/map/states/tool.state';

export interface ToolService {
  startMeasurement(measurementType: MeasurementTool): void;
}
