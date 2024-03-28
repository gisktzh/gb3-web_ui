import {ActiveMapItem} from '../models/active-map-item.model';
import {Gb3StyledInternalDrawingRepresentation} from '../../shared/interfaces/internal-drawing-representation.interface';
import {Coordinates} from '../../shared/interfaces/coordinate.interface';
import {ReportOrientation} from '../../shared/interfaces/print.interface';

export interface PrintData {
  format: string;
  reportLayout: string;
  reportOrientation: ReportOrientation | undefined;
  title: string;
  comment: string;
  showLegend: boolean;
  dpi: number;
  scale: number;
  rotation: number;
  mapCenter: Coordinates;
  activeBasemapId: string;
  activeMapItems: ActiveMapItem[];
  drawings: Gb3StyledInternalDrawingRepresentation[];
}
