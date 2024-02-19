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
