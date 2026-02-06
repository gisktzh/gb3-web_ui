import {DrawingSymbolDescriptor} from './drawing-symbol-descriptor.interface';

export interface DrawingSymbolDefinition {
  type: string;
  size: number;
  rotation: number;
  fetchDrawingSymbolDescriptor(size: number, rotation: number): Promise<DrawingSymbolDescriptor>;
  toJSON(): string;
  belongsToCollection(id: string): boolean;
}
