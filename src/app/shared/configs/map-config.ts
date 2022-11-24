import SpatialReference from '@arcgis/core/geometry/SpatialReference';

export interface MapConfig {
  defaultSrs: __esri.SpatialReference;
  defaultCenter: {
    x: number;
    y: number;
  };
  defaultScale: number;
}

export const defaultMapConfig: MapConfig = {
  defaultSrs: new SpatialReference({wkid: 2056}),
  defaultCenter: {
    x: 2682260.0,
    y: 1248390.0
  },
  defaultScale: 50000
};
