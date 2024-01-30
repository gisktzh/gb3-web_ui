import {ActiveMapItem} from '../../map/models/active-map-item.model';
import {Gb3StyledInternalDrawingRepresentation} from './internal-drawing-representation.interface';

export interface MapRestoreItem {
  activeMapItems: ActiveMapItem[];
  basemapId: string;
  drawings: Gb3StyledInternalDrawingRepresentation[];
  x: number;
  y: number;
  scale: number;
}
