import {Feature, LineString, MultiPoint, MultiPolygon, Point, Polygon} from 'geojson';
import {DrawingLayer} from '../enums/drawing-layer.enum';
import {HasSrs} from './geojson-types-with-srs.interface';

export interface InternalDrawingRepresentation extends Feature {
  labelText?: string;
  source: DrawingLayer;
  geometry: (Point | LineString | Polygon | MultiPoint | MultiPolygon) & HasSrs;
}
