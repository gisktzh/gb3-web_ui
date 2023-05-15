import {SupportedCrs} from '../types/supported-crs';
import {Point} from 'geojson';

/**
 * A generic interface for a point with coordinate reference system information added. This is needed because GeoJSON does not specify a CRS
 * unless otherwise agreed (see https://datatracker.ietf.org/doc/html/rfc7946#section-4).
 *
 * Hence, whenever a Point is needed that might have non-standard CRS (i.e. not 4326), this wrapper interface should be used.
 */
export interface PointWithCrs extends Point {
  crs: SupportedCrs;
}
