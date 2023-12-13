import {ExternalServiceActiveMapItem} from '../models/external-service.model';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {ExternalKmlLayer, ExternalLayer, ExternalWmsLayer} from '../../shared/interfaces/external-layer.interface';
import {MapServiceType} from '../types/map-service.type';

export class ExternalMapItemWithFilteredLayersUtils {
  public static createExternalMapItemWithFilteredLayers(
    serviceType: MapServiceType,
    url: string,
    title: string,
    layers: ExternalLayer[],
    visible?: boolean,
    opacity?: number,
  ): ExternalServiceActiveMapItem {
    switch (serviceType) {
      case 'wms':
        return ActiveMapItemFactory.createExternalWmsMapItem(
          url,
          title,
          layers.filter((layer): layer is ExternalWmsLayer => !!layer),
          visible,
          opacity,
        );
      case 'kml':
        return ActiveMapItemFactory.createExternalKmlMapItem(
          url,
          title,
          layers.filter((layer): layer is ExternalKmlLayer => !!layer),
          visible,
          opacity,
        );
    }
  }
}
