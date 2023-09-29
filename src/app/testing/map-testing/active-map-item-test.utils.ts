import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../map/models/implementations/drawing.model';
import {MapConstants} from '../../shared/constants/map.constants';

export function createGb2WmsMapItemMock(id: string, numberOfLayers = 0): {id: string; activeMapItem: Gb2WmsActiveMapItem} {
  const mapMock = {id: id, title: id, layers: []} as Partial<Map>;
  for (let layerNumber = 0; layerNumber < numberOfLayers; layerNumber++) {
    const uniqueLayerName = `layer${layerNumber}_${id}`;
    const layerMock = {layer: uniqueLayerName, title: uniqueLayerName, id: layerNumber, visible: true} as Partial<MapLayer>;
    mapMock.layers?.push(<MapLayer>layerMock);
  }
  return {id: id, activeMapItem: ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock)};
}

export function createDrawingMapItemMock(id: UserDrawingLayer): {id: UserDrawingLayer; activeMapItem: DrawingActiveMapItem} {
  return {id: id, activeMapItem: ActiveMapItemFactory.createDrawingMapItem(id, MapConstants.USER_DRAWING_LAYER_PREFIX, true, 1)};
}
