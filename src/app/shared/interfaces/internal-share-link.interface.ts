import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {Coordinate} from './coordinate.interface';
import {Gb3StyledInternalDrawingRepresentation} from './internal-drawing-representation.interface';

export interface InternalShareLinkItem {
  center: Coordinate;
  scale: number;
  basemapId: string;
  content: ActiveMapItemConfiguration[];
  drawings: Gb3StyledInternalDrawingRepresentation[];
  measurements: Gb3StyledInternalDrawingRepresentation[];
}
