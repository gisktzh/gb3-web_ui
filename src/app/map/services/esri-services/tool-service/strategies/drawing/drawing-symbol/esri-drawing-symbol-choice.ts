import {DrawingSymbolChoice} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-choice.interface';
import {EsriDrawingSymbolDefinition} from './esri-drawing-symbol-definition';

export interface EsriDrawingSymbolChoice extends DrawingSymbolChoice {
  item: EsriDrawingSymbolDefinition;
}
