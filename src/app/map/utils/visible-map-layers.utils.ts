import {ActiveMapItem} from '../models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../models/implementations/gb2-wms.model';
import {isActiveMapItemOfType} from '../../shared/type-guards/active-map-item-type.type-guard';

export function findVisibleMapLayers(items: ActiveMapItem[], scale: number) {
  return items
    .filter(isActiveMapItemOfType(Gb2WmsActiveMapItem))
    .filter((item) => !item.isTemporary && item.visible)
    .map((item) => ({
      item,
      layers: item.settings.layers.filter((layer) => layer.visible && layer.minScale < scale && layer.maxScale > scale),
    }));
}
