import {ExternalServiceActiveMapItem} from '../models/external-service.model';
import {ExternalLayerId} from '../../shared/types/external-layer-id.type';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../shared/interfaces/external-layer.interface';

export class ExternalMapItemWithFilteredLayersUtils {
  public static createExternalMapItemWithFilteredLayers(
    externalMapItem: ExternalServiceActiveMapItem,
    selectedLayerIds: ExternalLayerId[],
    title: string,
  ): ExternalServiceActiveMapItem {
    const selectedLayers = externalMapItem.settings.layers.filter((layer) => selectedLayerIds.includes(layer.id));
    switch (externalMapItem.settings.mapServiceType) {
      case 'wms':
        return ActiveMapItemFactory.createExternalWmsMapItem(
          externalMapItem.settings.url,
          title,
          // the following cast is safe because we know that it must be the correct layer type due to the map service type.
          selectedLayers as ExternalWmsLayer[],
          externalMapItem.visible,
          externalMapItem.opacity,
        );
      case 'kml':
        return ActiveMapItemFactory.createExternalKmlMapItem(
          externalMapItem.settings.url,
          title,
          // the following cast is safe because we know that it must be the correct layer type due to the map service type.
          selectedLayers as ExternalKmlLayer[],
          externalMapItem.visible,
          externalMapItem.opacity,
        );
    }
  }
}
