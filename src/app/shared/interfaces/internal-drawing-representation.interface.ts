import {Feature} from 'geojson';

export interface InternalDrawingRepresentation extends Feature {
  labelText?: string;
}
