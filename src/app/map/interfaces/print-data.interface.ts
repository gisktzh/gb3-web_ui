import {ActiveMapItem} from '../models/active-map-item.model';
import {Gb3StyledInternalDrawingRepresentation} from '../../shared/interfaces/internal-drawing-representation.interface';
import {Coordinate} from '../../shared/interfaces/coordinate.interface';
import {ReportOrientation} from '../../shared/interfaces/print.interface';

export interface PrintData {
  format: string;
  reportLayout: string;
  reportType: string;
  reportOrientation: ReportOrientation | undefined;
  title: string;
  comment: string;
  showLegend: boolean;
  dpi: number;
  scale: number;
  rotation: number;
  mapCenter: Coordinate;
  activeBasemapId: string;
  activeMapItems: ActiveMapItem[];
  drawings: Gb3StyledInternalDrawingRepresentation[];
}
