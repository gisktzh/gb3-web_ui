import {Injectable} from '@angular/core';
import {ELEVATION_PROFILE_CHARTJS_DATASET, ELEVATION_PROFILE_CHARTJS_OPTIONS} from '../configs/chartjs.config';
import {ElevationProfileChartJsDataset, ElevationProfileChartJsOptions} from '../interfaces/chartjs.interface';
import {ElevationProfileDataPoint} from '../../../../../shared/interfaces/elevation-profile.interface';

@Injectable({
  providedIn: 'root',
})
export class ElevationPlotConfigService {
  public getElevationPlotChartOptions(): ElevationProfileChartJsOptions {
    return ELEVATION_PROFILE_CHARTJS_OPTIONS;
  }

  public createElevationProfileDataset(
    elevationProfileData: ElevationProfileDataPoint[],
    dataLabel: string,
  ): ElevationProfileChartJsDataset {
    return {
      ...ELEVATION_PROFILE_CHARTJS_DATASET,
      data: elevationProfileData,
      label: dataLabel,
    };
  }
}
