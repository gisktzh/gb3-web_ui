import {ChartDataset, ChartOptions} from 'chart.js';
import {ElevationProfileDataPoint} from '../../../../../shared/interfaces/elevation-profile.interface';
import {ChartTypeRegistry, ScaleOptionsByType} from 'chart.js/dist/types';

export interface ElevationProfileChartJsDataset extends ChartDataset<'line', ElevationProfileDataPoint[]> {
  parsing: {
    xAxisKey: keyof ElevationProfileDataPoint;
    yAxisKey: keyof ElevationProfileDataPoint;
  };
}

export interface ElevationProfileChartJsOptions extends ChartOptions<'line'> {
  scales: {
    x: Partial<ScaleOptionsByType<ChartTypeRegistry['line']['scales']>>;
    y: Partial<ScaleOptionsByType<ChartTypeRegistry['line']['scales']>>;
  };
}
