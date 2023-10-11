import {DrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';

export interface EsriToolStrategy {
  internalLayerType: DrawingLayer;
  start: () => void;
  cancel: () => void;
}
