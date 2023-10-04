import {Feature, LineString, MultiPoint, Point, Polygon} from 'geojson';
import {DrawingLayer} from '../enums/drawing-layer.enum';

export interface InternalDrawingRepresentation extends Feature {
  labelText?: string;
  geometry: Point | LineString | Polygon | MultiPoint;
  source: DrawingLayer;
}
