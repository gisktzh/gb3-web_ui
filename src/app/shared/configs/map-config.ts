import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {EsriPoint} from '../external/esri.module';

const defaultSrs = new SpatialReference({wkid: 2056});

export interface MapConfig {
  defaultSrs: __esri.SpatialReference;
  defaultCenter: __esri.Point;
  defaultScale: number;
}

export const defaultMapConfig: MapConfig = {
  defaultSrs: defaultSrs,
  defaultCenter: new EsriPoint({
    x: 2682260.0,
    y: 1248390.0,
    spatialReference: defaultSrs
  }),
  defaultScale: 50000
};
