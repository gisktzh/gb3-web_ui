import {BehaviorSubject, Observable} from 'rxjs';
import {DrawingSymbolChoice} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-choice.interface';
import {DrawingSymbolDefinition} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {DrawingSymbolDescriptor} from 'src/app/shared/interfaces/drawing-symbol/drawing-symbol-descriptor.interface';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

export class DrawingSymbolServiceStub implements DrawingSymbolsService {
  getCollectionInfos(): {label: string; id: string}[] {
    return [];
  }

  getCollection(id: string): Observable<DrawingSymbolChoice[]> {
    const subj = new BehaviorSubject([]);
    return subj.asObservable();
  }

  convertToMapDrawingSymbol(symbol: DrawingSymbolDefinition, size: number, rotation: number): Promise<MapDrawingSymbol> {
    return new Promise((resolve) => resolve({}));
  }

  getSVGString(symbol: DrawingSymbolDescriptor, iconSize: number): string {
    return '<svg />;';
  }

  mapDrawingSymbolFromJSON(jsonString: string): Promise<MapDrawingSymbol> {
    return new Promise((resolve) => resolve({}));
  }

  isSameSymbol(a: DrawingSymbolDefinition, b: DrawingSymbolDefinition): boolean {
    return true;
  }
}
