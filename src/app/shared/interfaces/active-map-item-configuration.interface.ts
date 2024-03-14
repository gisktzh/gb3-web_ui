import {FavouriteFilterConfiguration, MapLayer} from './topic.interface';
import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';

type ActiveMapItemLayerConfiguration = Pick<MapLayer, 'id' | 'layer' | 'visible'>;

export interface ActiveMapItemConfiguration extends Pick<Gb2WmsActiveMapItem, 'id' | 'visible' | 'opacity' | 'isSingleLayer'> {
  layers: ActiveMapItemLayerConfiguration[];
  mapId: string;
  attributeFilters: FavouriteFilterConfiguration[] | undefined;
  timeExtent: TimeExtent | undefined;
}

// This is used to ensure no fields are lost during stringifying and parsing the map state when logging in or out of the application.
// All values that can be undefined need to be set as undefined here so they will be added back to the shareLinkItem after parsing from sessionStorage.
export const defaultActiveMapItemConfiguration: Partial<ActiveMapItemConfiguration> = {
  timeExtent: undefined,
  attributeFilters: undefined,
};
