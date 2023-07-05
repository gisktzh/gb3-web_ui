import {MapLayer} from './topic.interface';
import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';

type ActiveMapItemLayerConfiguration = Pick<MapLayer, 'id' | 'layer' | 'visible'>;

export interface ActiveMapItemConfiguration extends Pick<Gb2WmsActiveMapItem, 'visible' | 'opacity' | 'isSingleLayer'> {
  layers: ActiveMapItemLayerConfiguration[];
  mapId: string;
}
