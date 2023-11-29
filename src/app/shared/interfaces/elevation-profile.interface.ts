export interface ElevationProfileDataPointXAxis {
  distance: number;
}

export interface ElevationProfileDataPointYAxis {
  altitude: number;
}

export interface ElevationProfileDataPoint extends ElevationProfileDataPointXAxis, ElevationProfileDataPointYAxis {}

export interface ElevationProfileStatistics {
  linearDistance: number;
  groundDistance: number;
  elevationDifference: number;
  lowestPoint: number;
  highestPoint: number;
}

export interface ElevationProfileData {
  dataPoints: ElevationProfileDataPoint[];
  statistics: ElevationProfileStatistics;
}
