import {Feature, LineString, MultiPoint, MultiPolygon, Point, Polygon} from 'geojson';
import {DrawingLayer} from '../enums/drawing-layer.enum';

export interface InternalDrawingRepresentation extends Feature {
  labelText?: string;
  source: DrawingLayer;
  geometry: Point | LineString | Polygon | MultiPoint | MultiPolygon;
}
