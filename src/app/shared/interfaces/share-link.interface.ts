import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {UserDrawingVectorLayers} from './user-drawing-vector-layers.interface';
import {Coordinates} from './coordinate.interface';

export interface ShareLinkItem extends UserDrawingVectorLayers {
  center: Coordinates;
  scale: number;
  basemapId: string;
  content: ActiveMapItemConfiguration[];
}
