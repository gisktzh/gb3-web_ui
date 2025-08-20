import {ChartConfiguration} from 'chart.js';
import {ElevationProfileDataPoint} from '../../../../../shared/interfaces/elevation-profile.interface';

export type ElevationProfileChartJsDataConfiguration = ChartConfiguration<'line', ElevationProfileDataPoint[]>['data'];

/**
 * DeepPartial implementation taken from the utility-types NPM package, which is
 * Copyright (c) 2016 Piotr Witek <piotrek.witek@gmail.com> (http://piotrwitek.github.io)
 * and used under the terms of the MIT license
 * Exported from https://github.com/chartjs/Chart.js/blob/master/src/types/utils.d.ts as it is not part of public API
 * Note: ng-charts still relies on this type, which is why the path is added in tsconfig. However, our code should not
 * rely on this, which is why we duplicated this code here.
 */
export type ChartJsDeepPartial<T> = T extends Function // eslint-disable-line @typescript-eslint/no-unsafe-function-type -- library type
  ? T
  : T extends Array<infer U>
    ? _DeepPartialArray<U>
    : T extends object
      ? _DeepPartialObject<T>
      : T | undefined;

type _DeepPartialArray<T> = Array<ChartJsDeepPartial<T>>;
type _DeepPartialObject<T> = {[P in keyof T]?: ChartJsDeepPartial<T[P]>};
