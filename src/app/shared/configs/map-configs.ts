import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {EsriPoint} from '../external/esri.module';

const defaultSrs = new SpatialReference({wkid: 2056});

const defaultCenter = new EsriPoint({
  x: 2682260.0,
  y: 1248390.0,
  spatialReference: defaultSrs
});

const defaultScale = 50000;

export {defaultScale, defaultCenter, defaultSrs};
