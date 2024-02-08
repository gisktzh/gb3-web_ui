import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../map/models/implementations/drawing.model';
import {MapConstants} from '../../shared/constants/map.constants';
import {UuidUtils} from '../../shared/utils/uuid.utils';
import {ExternalKmlLayer, ExternalWmsLayer} from '../../shared/interfaces/external-layer.interface';
import {ExternalWmsActiveMapItem} from '../../map/models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../map/models/implementations/external-kml.model';

export function createGb2WmsMapItemMock(
  id: string,
  numberOfLayers: number = 0,
  visible: boolean = true,
  opacity: number = 1,
  uuid: string = UuidUtils.createUuid(),
  isTemporary: boolean = false,
): Gb2WmsActiveMapItem {
  const mapMock = {id, title: id, layers: [], uuid} as Partial<Map>;
  for (let layerNumber = 0; layerNumber < numberOfLayers; layerNumber++) {
    const uniqueLayerName = `layer${layerNumber}_${id}`;
    const layerMock = {layer: uniqueLayerName, title: uniqueLayerName, id: layerNumber} as Partial<MapLayer>;
    mapMock.layers?.push(<MapLayer>layerMock);
  }
  return ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock, undefined, visible, opacity, isTemporary);
}

export function createDrawingMapItemMock(id: UserDrawingLayer, visible: boolean = true, opacity: number = 1): DrawingActiveMapItem {
  return ActiveMapItemFactory.createDrawingMapItem(id, MapConstants.USER_DRAWING_LAYER_PREFIX, visible, opacity);
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
