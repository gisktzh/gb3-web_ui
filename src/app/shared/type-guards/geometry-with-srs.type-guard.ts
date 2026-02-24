import {Geometry} from 'geojson';
import {GeometryWithSrs} from '../interfaces/geojson-types-with-srs.interface';

export function isGeometryWithSrs(geometry: GeometryWithSrs | Geometry): geometry is GeometryWithSrs {
  return !!(geometry as GeometryWithSrs).srs;
}
