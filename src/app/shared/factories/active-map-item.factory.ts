import {Map, MapLayer} from '../interfaces/topic.interface';

import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {DrawingActiveMapItem} from '../../map/models/implementations/drawing.model';
import {UserDrawingLayer} from '../enums/drawing-layer.enum';
import {ExternalKmlLayer, ExternalWmsLayer} from '../interfaces/external-layer.interface';
import {ExternalWmsActiveMapItem} from '../../map/models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../map/models/implementations/external-kml.model';

export class ActiveMapItemFactory {
  public static createTemporaryGb2WmsMapItem(map: Map, layer?: MapLayer, visible?: boolean, opacity?: number): Gb2WmsActiveMapItem {
    return ActiveMapItemFactory.createGb2WmsMapItem(map, layer, visible, opacity, true);
  }

  public static createGb2WmsMapItem(
    map: Map,
    layer?: MapLayer,
    visible?: boolean,
    opacity?: number,
    isTemporary?: boolean,
  ): Gb2WmsActiveMapItem {
    if (opacity === undefined) {
      opacity = map.opacity;
    }
    return new Gb2WmsActiveMapItem(map, layer, visible, opacity, isTemporary);
  }

  public static createDrawingMapItem(id: UserDrawingLayer, prefix: string, visible?: boolean, opacity?: number): DrawingActiveMapItem {
    let title: string;
    switch (id) {
      case UserDrawingLayer.Drawings:
        title = 'Zeichnungen';
        break;
      case UserDrawingLayer.Measurements:
        title = 'Messungen';
        break;
    }

    const fullLayerIdentifier = prefix + id;
    return new DrawingActiveMapItem(title, fullLayerIdentifier, id, visible, opacity);
  }

  public static createExternalWmsMapItem(
    url: string,
    title: string,
    layers: ExternalWmsLayer[],
    imageFormat: string | undefined,
    visible?: boolean,
    opacity?: number,
  ): ExternalWmsActiveMapItem {
    return new ExternalWmsActiveMapItem(url, title, layers, imageFormat, visible, opacity);
  }

  public static createExternalKmlMapItem(
    url: string,
    title: string,
    layers: ExternalKmlLayer[],
    visible?: boolean,
    opacity?: number,
  ): ExternalKmlActiveMapItem {
    return new ExternalKmlActiveMapItem(url, title, layers, visible, opacity);
  }
}
