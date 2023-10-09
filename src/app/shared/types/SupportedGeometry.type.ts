import {LineString, MultiPoint, MultiPolygon, Point, Polygon} from 'geojson';

export type SupportedGeometry = Point | LineString | Polygon | MultiPoint | MultiPolygon;
