import {MeasurementTool} from '../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../shared/types/drawing-tool.type';
import {DataDownloadSelectionTool} from '../../shared/types/data-download-selection-tool.type';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

export interface ToolService {
  initializeMeasurement(measurementTool: Exclude<MeasurementTool, 'measure-elevation-profile'>): void;

  initializeElevationProfileMeasurement(): void;

  initializeDrawing(drawingTool: DrawingTool): void;

  initializeDataDownloadSelection(selectionTool: DataDownloadSelectionTool): void;

  addExistingDrawingsToLayer(drawingsToAdd: Gb3StyledInternalDrawingRepresentation[], layerIdentifier: DrawingLayer): Promise<void>;

  updateDrawingStyles(
    drawing: Gb3StyledInternalDrawingRepresentation,
    style: Gb3StyleRepresentation,
    labelText?: string,
    mapDrawingSymbol?: MapDrawingSymbol | null,
  ): Promise<void>;

  cancelTool(): void;
}
