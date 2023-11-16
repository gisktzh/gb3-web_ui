import {ElevationProfileMeasurementTool, MeasurementTool} from '../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../shared/types/drawing-tool.type';
import {DataDownloadSelectionTool} from '../../shared/types/data-download-selection-tool.type';
import {Gb3StyledInternalDrawingRepresentation} from '../../shared/interfaces/internal-drawing-representation.interface';
import {UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';

export interface ToolService {
  initializeMeasurement(measurementTool: MeasurementTool): void;

  initializeElevationProfileMeasurement(measurementTool: ElevationProfileMeasurementTool): void;

  initializeDrawing(drawingTool: DrawingTool): void;

  initializeDataDownloadSelection(selectionTool: DataDownloadSelectionTool): void;

  addExistingDrawingsToLayer(drawingsToAdd: Gb3StyledInternalDrawingRepresentation[], layerIdentifier: UserDrawingLayer): void;

  cancelTool(): void;
}
