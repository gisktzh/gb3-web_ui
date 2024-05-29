import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {UserDrawingVectorLayers} from './user-drawing-vector-layers.interface';
import {Coordinate} from './coordinate.interface';

export interface ShareLinkItem extends UserDrawingVectorLayers {
  center: Coordinate;
  scale: number;
  basemapId: string;
  content: ActiveMapItemConfiguration[];
}
