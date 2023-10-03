import {Feature} from 'geojson';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';

export interface InternalDrawingRepresentation extends Feature {
  labelText?: string;
  source: UserDrawingLayer;
}
