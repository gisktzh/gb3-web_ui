import {EditableTool, EditTarget} from '../../state/map/states/tool.state';
import {ToolType} from '../../shared/types/tool.type';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

export interface ToolService {
  startCreation(tool: ToolType, interactionId: number): void;

  startEditing(tool: EditableTool, target: EditTarget, interactionId: number): void;

  finishInteraction(interactionId: number): void;

  addExistingDrawingsToLayer(drawingsToAdd: Gb3StyledInternalDrawingRepresentation[], layerIdentifier: DrawingLayer): Promise<void>;

  updateDrawingStyles(
    drawing: Gb3StyledInternalDrawingRepresentation,
    style: Gb3StyleRepresentation,
    labelText?: string,
    mapDrawingSymbol?: MapDrawingSymbol | null,
  ): Promise<void>;

  cancelTool(): void;
}
