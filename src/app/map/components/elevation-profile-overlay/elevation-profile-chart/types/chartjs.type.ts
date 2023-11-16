import {ChartConfiguration} from 'chart.js';
import {ElevationProfileDataPoint} from '../../../../../shared/interfaces/elevation-profile.interface';

export type ElevationProfileChartJsDataConfiguration = ChartConfiguration<'line', ElevationProfileDataPoint[]>['data'];
