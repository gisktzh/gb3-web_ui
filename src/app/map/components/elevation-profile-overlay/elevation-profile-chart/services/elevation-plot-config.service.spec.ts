import {TestBed} from '@angular/core/testing';
import {ElevationPlotConfigService} from './elevation-plot-config.service';
import {ELEVATION_PROFILE_CHARTJS_DATASET, ELEVATION_PROFILE_CHARTJS_OPTIONS} from '../configs/chartjs.config';
import {ElevationProfileDataPoint} from '../../../../../shared/interfaces/elevation-profile.interface';
import {ElevationProfileChartJsDataset} from '../interfaces/chartjs.interface';

describe('GeoJsonMapperService', () => {
  let service: ElevationPlotConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ElevationPlotConfigService);
  });

  describe('getElevationPlotChartOptions', () => {
    it('returns the elevation profile options for chartjs', () => {
      const result = service.getElevationPlotChartOptions();

      expect(result).toEqual(ELEVATION_PROFILE_CHARTJS_OPTIONS);
    });
  });

  describe('createElevationProfileDataset', () => {
    it('creates a dataset using the properties and the base config', () => {
      const mockElevationProfileData: ElevationProfileDataPoint[] = [
        {distance: 1, altitude: 2, location: {type: 'Point', coordinates: [1, 2], srs: 2056}},
        {distance: 3, altitude: 4, location: {type: 'Point', coordinates: [3, 4], srs: 2056}},
      ];
      const mockLabel = 'The only edible fruit in Mirkwood are nuts ¯\\_(ツ)_/¯';

      const result = service.createElevationProfileDataset(mockElevationProfileData, mockLabel);

      const expected: ElevationProfileChartJsDataset = {
        ...ELEVATION_PROFILE_CHARTJS_DATASET,
        data: mockElevationProfileData,
        label: mockLabel,
      };
      expect(result).toEqual(expected);
    });
  });
});
