import {UnstyledInternalDrawingRepresentation} from './internal-drawing-representation.interface';
import {DataDownloadSelectionTool} from '../types/data-download-selection-tool.type';
import {Municipality} from './gb3-geoshop-product.interface';

interface AbstractDataDownloadSelection {
  type: DataDownloadSelectionTool;
  drawingRepresentation: UnstyledInternalDrawingRepresentation;
}

export interface GeometryDataDownloadSelection extends AbstractDataDownloadSelection {
  type: Exclude<DataDownloadSelectionTool, 'select-municipality'>;
}

export interface MunicipalityDataDownloadSelection extends AbstractDataDownloadSelection {
  type: 'select-municipality';
  municipality: Municipality;
}

export type DataDownloadSelection = GeometryDataDownloadSelection | MunicipalityDataDownloadSelection;
