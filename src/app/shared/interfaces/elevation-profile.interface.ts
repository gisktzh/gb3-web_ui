import {PointWithSrs} from './geojson-types-with-srs.interface';

interface ElevationProfileDataPointLocation {
  location: PointWithSrs;
}

export interface ElevationProfileDataPointXAxis {
  distance: number;
}

export interface ElevationProfileDataPointYAxis {
  altitude: number;
}

export interface ElevationProfileDataPoint
  extends ElevationProfileDataPointXAxis, ElevationProfileDataPointYAxis, ElevationProfileDataPointLocation {}

export interface ElevationProfileStatistics {
  linearDistance: number;
  groundDistance: number;
  elevationDifference: number;
  lowestPoint: number;
  highestPoint: number;
}

interface ElevationProfileRequest {
  url: string;
  params: URLSearchParams;
}

export interface ElevationProfileData {
  dataPoints: ElevationProfileDataPoint[];
  statistics: ElevationProfileStatistics;
  csvRequest: ElevationProfileRequest;
}
