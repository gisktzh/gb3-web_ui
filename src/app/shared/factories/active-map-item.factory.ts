import {Map, MapLayer} from '../interfaces/topic.interface';
import {ActiveMapItem, Gb2WmsMapItemConfiguration} from '../../map/models/active-map-item.model';

export class ActiveMapItemFactory {
  public static createGb2WmsMapItem(
    map: Map,
    layer?: MapLayer,
    visible?: boolean,
    opacity?: number
  ): ActiveMapItem<Gb2WmsMapItemConfiguration> {
    const configuration = new Gb2WmsMapItemConfiguration(map, layer);
    const id = layer ? Gb2WmsMapItemConfiguration.createSingleLayerId(map.id, layer.layer) : map.id;
    const title = layer ? layer.title : map.title;
    const hasSublayers = !!layer;

    return new ActiveMapItem(id, title, configuration, map.icon, hasSublayers, visible, opacity);
  }
}
