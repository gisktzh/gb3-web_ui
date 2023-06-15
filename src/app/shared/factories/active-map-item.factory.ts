import {Map, MapLayer} from '../interfaces/topic.interface';
import {Gb2WmsActiveMapItem, Gb2WmsMapItemConfiguration} from '../../map/models/active-map-item.model';

export class ActiveMapItemFactory {
  public static createGb2WmsMapItem(map: Map, layer?: MapLayer, visible?: boolean, opacity?: number): Gb2WmsActiveMapItem {
    const configuration = new Gb2WmsMapItemConfiguration(map, layer);
    const id = layer ? Gb2WmsMapItemConfiguration.createSingleLayerId(map.id, layer.layer) : map.id;
    const title = layer ? layer.title : map.title;
    const hasSublayers = !!layer;

    return new Gb2WmsActiveMapItem(id, title, configuration, map.icon, hasSublayers, visible, opacity);
  }
}
