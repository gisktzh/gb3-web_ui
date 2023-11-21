import {ChartDataset, ChartOptions} from 'chart.js';
import {ElevationProfileDataPoint} from '../../../../../shared/interfaces/elevation-profile.interface';
import {ChartTypeRegistry, ScaleOptionsByType} from 'chart.js/dist/types';
import {DeepPartial} from 'chart.js/dist/types/utils';

export interface ElevationProfileChartJsDataset extends ChartDataset<'line', ElevationProfileDataPoint[]> {
  parsing: {
    xAxisKey: keyof ElevationProfileDataPoint;
    yAxisKey: keyof ElevationProfileDataPoint;
  };
}

export interface ElevationProfileChartJsOptions extends ChartOptions<'line'> {
  scales: {
    x: DeepPartial<ScaleOptionsByType<ChartTypeRegistry['line']['scales']>>;
    y: DeepPartial<ScaleOptionsByType<ChartTypeRegistry['line']['scales']>>;
  };
}
