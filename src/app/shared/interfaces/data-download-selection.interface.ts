import {UnstyledInternalDrawingRepresentation} from './internal-drawing-representation.interface';
import {DataDownloadSelectionTool} from '../types/data-download-selection-tool.type';
import {Municipality} from './geoshop-product.interface';

interface AbstractDataDownloadSelection {
  type: DataDownloadSelectionTool;
  drawingRepresentation: UnstyledInternalDrawingRepresentation;
}

interface GeometryDataDownloadSelection extends AbstractDataDownloadSelection {
  type: Exclude<DataDownloadSelectionTool, 'select-municipality'>;
}

interface MunicipalityDataDownloadSelection extends AbstractDataDownloadSelection {
  type: 'select-municipality';
  municipality: Municipality;
}

export type DataDownloadSelection = GeometryDataDownloadSelection | MunicipalityDataDownloadSelection;
