import {Gb3StyledInternalDrawingRepresentation} from '../../../shared/interfaces/internal-drawing-representation.interface';

export interface DrawingState {
  drawings: Gb3StyledInternalDrawingRepresentation[];
  selectedDrawing: Gb3StyledInternalDrawingRepresentation | undefined;
}
