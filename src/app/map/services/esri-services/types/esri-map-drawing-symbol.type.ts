import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';
import {EsriDrawingSymbolDefinition} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {EsriDrawingSymbolDescriptor} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';

export interface EsriMapDrawingSymbol extends MapDrawingSymbol {
  drawingSymbolDefinition?: EsriDrawingSymbolDefinition;
  drawingSymbolDescriptor?: EsriDrawingSymbolDescriptor;
}
