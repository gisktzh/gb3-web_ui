import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';
import {UserDrawingVectorLayers} from './user-drawing-vector-layers.interface';

export interface ShareLinkItem extends UserDrawingVectorLayers {
  center: {x: number; y: number};
  scale: number;
  basemapId: string;
  content: ActiveMapItemConfiguration[];
}

export interface ShareLinkResponse {
  shareLinkId: string;
}
