import {Map, MapLayer} from '../interfaces/topic.interface';
import {Gb2WmsActiveMapItem} from '../../map/models/active-map-item.model';

export class ActiveMapItemFactory {
  public static createGb2WmsMapItem(map: Map, layer?: MapLayer, visible?: boolean, opacity?: number): Gb2WmsActiveMapItem {
    return new Gb2WmsActiveMapItem(map, layer, visible, opacity);
  }
}
