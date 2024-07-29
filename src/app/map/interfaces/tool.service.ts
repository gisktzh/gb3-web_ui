import {MeasurementTool} from '../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../shared/types/drawing-tool.type';
import {DataDownloadSelectionTool} from '../../shared/types/data-download-selection-tool.type';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';

export interface ToolService {
  initializeMeasurement(measurementTool: Exclude<MeasurementTool, 'measure-elevation-profile'>): void;

  initializeElevationProfileMeasurement(): void;

  initializeDrawing(drawingTool: DrawingTool): void;

  initializeDataDownloadSelection(selectionTool: DataDownloadSelectionTool): void;

  addExistingDrawingsToLayer(drawingsToAdd: Gb3StyledInternalDrawingRepresentation[], layerIdentifier: UserDrawingLayer): void;

  updateDrawingStyling(drawing: Gb3StyledInternalDrawingRepresentation, style: Gb3StyleRepresentation): void;

  cancelTool(): void;
}
