import {DrawingSymbolDefinition} from './drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolDescriptor} from './drawing-symbol/drawing-symbol-descriptor.interface';

export interface MapDrawingSymbol {
  drawingSymbolDefinition?: DrawingSymbolDefinition;
  drawingSymbolDescriptor?: DrawingSymbolDescriptor;
}
