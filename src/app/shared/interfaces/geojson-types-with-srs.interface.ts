import {SupportedSrs} from '../types/supported-srs';
import {Geometry, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon} from 'geojson';

/**
 * A generic interface for adding SRS information that is supported in the application to any object.
 *
 * Mainly used for adding SRS information to GeoJSON objects because the specification does not specify an SRS
 * unless otherwise agreed (see https://datatracker.ietf.org/doc/html/rfc7946#section-4).
 * Hence, whenever a GeoJSON object is needed that might have non-standard SRS (i.e. not 4326), this wrapper interface should be used.
 */
export interface HasSrs {
  srs: SupportedSrs;
}

export type GeometryWithSrs = Geometry & HasSrs;

export interface PointWithSrs extends Point, HasSrs {}

export interface MultiPointWithSrs extends MultiPoint, HasSrs {}

export interface PolygonWithSrs extends Polygon, HasSrs {}

export interface MultiPolygonWithSrs extends MultiPolygon, HasSrs {}

export interface LineStringWithSrs extends LineString, HasSrs {}

export interface MultiLineStringWithSrs extends MultiLineString, HasSrs {}
