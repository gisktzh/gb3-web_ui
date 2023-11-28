import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../map/models/implementations/drawing.model';
import {MapConstants} from '../../shared/constants/map.constants';

export function createGb2WmsMapItemMock(
  id: string,
  numberOfLayers: number = 0,
  visible: boolean = true,
  opacity: number = 1,
): Gb2WmsActiveMapItem {
  const mapMock = {id: id, title: id, layers: [], uuid: createUuidFromId(id)} as Partial<Map>;
  for (let layerNumber = 0; layerNumber < numberOfLayers; layerNumber++) {
    const uniqueLayerName = `layer${layerNumber}_${id}`;
    const layerMock = {layer: uniqueLayerName, title: uniqueLayerName, id: layerNumber} as Partial<MapLayer>;
    mapMock.layers?.push(<MapLayer>layerMock);
  }
  return ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock, undefined, visible, opacity);
}

export function createUuidFromId(id: string): string {
  return `uuid_${id}`;
}

export function createDrawingMapItemMock(id: UserDrawingLayer, visible: boolean = true, opacity: number = 1): DrawingActiveMapItem {
  return ActiveMapItemFactory.createDrawingMapItem(id, MapConstants.USER_DRAWING_LAYER_PREFIX, visible, opacity);
}
