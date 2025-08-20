import {ChartDataset, ChartOptions, ChartTypeRegistry, ScaleOptionsByType} from 'chart.js';
import {
  ElevationProfileDataPoint,
  ElevationProfileDataPointXAxis,
  ElevationProfileDataPointYAxis,
} from '../../../../../shared/interfaces/elevation-profile.interface';
import {ChartJsDeepPartial} from '../types/chartjs.type';

export interface ElevationProfileChartJsDataset extends ChartDataset<'line', ElevationProfileDataPoint[]> {
  parsing: {
    xAxisKey: keyof ElevationProfileDataPointXAxis;
    yAxisKey: keyof ElevationProfileDataPointYAxis;
  };
}

/**
 * Fixed linechart representatiot for chartjs.
 *
 * @see https://github.com/piotrwitek/utility-types#deeppartialt
 */
export interface ElevationProfileChartJsOptions extends ChartOptions<'line'> {
  scales: {
    x: ChartJsDeepPartial<ScaleOptionsByType<ChartTypeRegistry['line']['scales']>>;
    y: ChartJsDeepPartial<ScaleOptionsByType<ChartTypeRegistry['line']['scales']>>;
  };
}
