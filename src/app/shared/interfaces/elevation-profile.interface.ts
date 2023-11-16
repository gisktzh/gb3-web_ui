export interface ElevationProfileDataPoint {
  distance: number;
  altitude: number;
}

export interface ElevationProfileData {
  dataPoints: ElevationProfileDataPoint[];
  maxDistance: number;
}
