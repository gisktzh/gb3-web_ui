import {ActiveMapItemConfiguration} from './active-map-item-configuration.interface';

export interface ShareLinkItem {
  center: {x: number; y: number};
  scale: number;
  basemapId: string;
  content: ActiveMapItemConfiguration[];
  drawings: any[]; // TODO: specify when the API interface is done
  measurements: any[]; // TODO: specify when the API interface is done
}

export interface ShareLinkResponse {
  shareLinkId: string;
}
