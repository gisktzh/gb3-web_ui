import {DrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import Graphic from '@arcgis/core/Graphic';

export interface EsriToolStrategy {
  internalLayerType: DrawingLayer;
  start: () => void;
  cancel: () => void;
  edit: (graphic: Graphic) => void;
}
