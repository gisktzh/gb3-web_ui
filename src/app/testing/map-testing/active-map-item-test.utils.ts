import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {FilterConfiguration, Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {DrawingLayerPrefix, UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../map/models/implementations/drawing.model';
import {UuidUtils} from '../../shared/utils/uuid.utils';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../shared/interfaces/external-layer.interface';
import {ExternalWmsActiveMapItem} from '../../map/models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../map/models/implementations/external-kml.model';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';

export function createGb2WmsMapItemMock(
  id: string,
  numberOfLayers: number = 0,
  visible: boolean = true,
  opacity: number = 1,
  uuid: string = UuidUtils.createUuid(),
  isTemporary: boolean = false,
  timeExtent?: TimeExtent,
  attributeFilters?: FilterConfiguration[],
): Gb2WmsActiveMapItem {
  const mapMock = {id, title: id, layers: [], uuid, wmsUrl: `https://${id}.com`} as Partial<Map>;
  for (let layerNumber = 0; layerNumber < numberOfLayers; layerNumber++) {
    const uniqueLayerName = `layer${layerNumber}_${id}`;
    const layerMock = {layer: uniqueLayerName, title: uniqueLayerName, id: layerNumber, visible: true} as Partial<MapLayer>;
    mapMock.layers?.push(<MapLayer>layerMock);
  }
  return ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock, undefined, visible, opacity, timeExtent, attributeFilters, isTemporary);
}

export function createDrawingMapItemMock(id: UserDrawingLayer, visible: boolean = true, opacity: number = 1): DrawingActiveMapItem {
  return ActiveMapItemFactory.createDrawingMapItem(id, DrawingLayerPrefix.Drawing, visible, opacity);
}

export function createExternalWmsMapItemMock(
  url: string,
  title: string,
  layers: ExternalWmsLayer[],
  imageFormat?: string,
  visible: boolean = true,
  opacity: number = 1,
): ExternalWmsActiveMapItem {
  return ActiveMapItemFactory.createExternalWmsMapItem(url, title, layers, imageFormat, visible, opacity);
}

export function createExternalKmlMapItemMock(
  url: string,
  title: string,
  layers: ExternalKmlLayer[],
  visible: boolean = true,
  opacity: number = 1,
): ExternalKmlActiveMapItem {
  return ActiveMapItemFactory.createExternalKmlMapItem(url, title, layers, visible, opacity);
}
