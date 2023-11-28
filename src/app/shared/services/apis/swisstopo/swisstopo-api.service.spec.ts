import {TestBed} from '@angular/core/testing';

import {ELEVATION_MODEL, SwisstopoApiService} from './swisstopo-api.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import {of} from 'rxjs';
import {ElevationProfileResponse} from '../../../models/swisstopo-api-generated.interface';
import {LineString} from 'geojson';
import {MinimalGeometriesUtils} from '../../../../testing/map-testing/minimal-geometries.utils';
import {ElevationProfileDataPoint, ElevationProfileStatistics} from '../../../interfaces/elevation-profile.interface';

describe('SwisstopoApiService', () => {
  let service: SwisstopoApiService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SwisstopoApiService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadElevationProfile', () => {
    it('should receive the data and transform it', (done: DoneFn) => {
      const mockData: ElevationProfileResponse[] = [
        {alts: {COMB: 11, DTM2: 21, DTM25: 31}, easting: 11, dist: 0, northing: 21},
        {alts: {COMB: 12, DTM2: 22, DTM25: 32}, easting: 12, dist: 10, northing: 22},
        {alts: {COMB: 13, DTM2: 23, DTM25: 33}, easting: 13, dist: 20, northing: 23},
        {alts: {COMB: -14, DTM2: -24, DTM25: -34}, easting: 14, dist: 30, northing: 24},
      ];
      const mockGeometry: LineString = MinimalGeometriesUtils.getMinimalLineString(2056);
      spyOn(httpClient, 'post').and.returnValue(of(mockData));

      const expectedDataPoints: ElevationProfileDataPoint[] = [
        {distance: mockData[0].dist, altitude: mockData[0].alts[ELEVATION_MODEL]},
        {distance: mockData[1].dist, altitude: mockData[1].alts[ELEVATION_MODEL]},
        {distance: mockData[2].dist, altitude: mockData[2].alts[ELEVATION_MODEL]},
        {distance: mockData[3].dist, altitude: mockData[3].alts[ELEVATION_MODEL]},
      ];
      /**
       * Given the mock data, and ELEVATION_MODEL === 'COMB', the following values are to be expected. Note that we do not calculated
       * them dynamically, because that would be a copy of the implementation, not a test of the outcome.
       */
      const expectedStatistics: ElevationProfileStatistics = {
        highestPoint: 13,
        lowestPoint: -14,
        elevationDifference: -25,
        linearDistance: 30,
        groundDistance: 10.04987562112089 + 10.04987562112089 + 28.792360097775937,
      };

      service.loadElevationProfile(mockGeometry).subscribe((elevationProfileData) => {
        expect(elevationProfileData).toBeDefined();
        expect(elevationProfileData.dataPoints).toEqual(expectedDataPoints);
        expect(elevationProfileData.statistics).toEqual(expectedStatistics);
        done();
      });
    });
  });
});
