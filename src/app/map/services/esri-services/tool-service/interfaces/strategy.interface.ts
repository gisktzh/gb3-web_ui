import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';

export interface EsriToolStrategy {
  internalLayerType: UserDrawingLayer;
  start: () => void;
  cancel: () => void;
}
