import {UnstyledInternalDrawingRepresentation} from './internal-drawing-representation.interface';
import {Municipality} from './gb3-geoshop-product.interface';
import {DataDownloadSelectionGeometry} from '../types/data-download-selection-geometry.type';

interface AbstractDataDownloadSelection {
  type: DataDownloadSelectionGeometry;
  drawingRepresentation: UnstyledInternalDrawingRepresentation;
}

export interface GeometryDataDownloadSelection extends AbstractDataDownloadSelection {
  type: Exclude<DataDownloadSelectionGeometry, 'municipality'>;
}

export interface MunicipalityDataDownloadSelection extends AbstractDataDownloadSelection {
  type: 'municipality';
  municipality: Municipality;
}

export type DataDownloadSelection = GeometryDataDownloadSelection | MunicipalityDataDownloadSelection;
