import {FavouriteLayerConfiguration} from './favourite.interface';

export interface ShareLinkItem {
  center: {x: number; y: number};
  scale: number;
  basemapId: string;
  content: FavouriteLayerConfiguration[]; // TODO: refactor
  drawings: object[]; // TODO: specify when the API interface is done
  measurements: object[]; // TODO: specify when the API interface is done
}

export interface ShareLinkResponse {
  shareLinkId: string;
}
