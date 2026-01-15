import {Observable} from 'rxjs';
import {MapDrawingSymbol} from './map-drawing-symbol.interface';
import {DrawingSymbolDefinition} from './drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolDescriptor} from './drawing-symbol/drawing-symbol-descriptor.interface';
import {DrawingSymbolChoice} from './drawing-symbol/drawing-symbol-choice.interface';

export interface DrawingSymbolsService {
  getCollectionInfos(): {label: string; id: string}[];
  getCollection(id: string): Observable<DrawingSymbolChoice[]>;
  convertToMapDrawingSymbol(symbol: DrawingSymbolDefinition, size: number, rotation: number): Promise<MapDrawingSymbol>;
  getSVGString(symbol: DrawingSymbolDescriptor, iconSize: number): string;
  mapDrawingSymbolFromJSON(jsonString: string): Promise<MapDrawingSymbol>;
  isSameSymbol(a: DrawingSymbolDefinition, b: DrawingSymbolDefinition): boolean;
}
