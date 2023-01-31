import {TestBed} from '@angular/core/testing';

import {EsriMapService} from './esri-map.service';
import {provideMockStore} from '@ngrx/store/testing';
import {ActiveMapItem} from '../models/active-map-item.model';
import {Map, MapLayer} from '../../shared/interfaces/topic.interface';
import {EsriMapMock} from '../../testing/map-testing/esri-map.mock';

function createActiveMapItemMock(topic: string, numberOfLayers = 0): {id: string; activeMapItem: ActiveMapItem} {
  const topicMock = {id: topic, title: topic, layers: []} as Partial<Map>;
  for (let layerNumber = 0; layerNumber < numberOfLayers; layerNumber++) {
    const uniqueLayerName = `layer${layerNumber}_${topic}`;
    const layerMock = {layer: uniqueLayerName, title: uniqueLayerName, id: layerNumber} as Partial<MapLayer>;
    topicMock.layers?.push(<MapLayer>layerMock);
  }
  return {id: topic, activeMapItem: new ActiveMapItem(<Map>topicMock)};
}

describe('EsriMapService', () => {
  let service: EsriMapService;
  let mapMock: EsriMapMock = new EsriMapMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(EsriMapService);
    // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
    mapMock = new EsriMapMock();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['_mapView'] = {map: mapMock} as __esri.MapView;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add new items to the desired position', () => {
    const {id: topic1Id, activeMapItem: mapItem1} = createActiveMapItemMock('topicOne');
    const {id: topic2Id, activeMapItem: mapItem2} = createActiveMapItemMock('topicTwo');
    const {id: topic3Id, activeMapItem: mapItem3} = createActiveMapItemMock('topicThree');

    expect(mapMock.layers.length).toBe(0);

    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);

    expect(mapMock.layers.length).toBe(3);
    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(topic3Id);
    expect(mapMock.layers.getItemAt(1).id).toBe(topic2Id);
    expect(mapMock.layers.getItemAt(2).id).toBe(topic1Id);

    service.removeAllMapItems();
    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 0);
    service.addMapItem(mapItem3, 0);

    expect(mapMock.layers.length).toBe(3);
    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(topic1Id);
    expect(mapMock.layers.getItemAt(1).id).toBe(topic2Id);
    expect(mapMock.layers.getItemAt(2).id).toBe(topic3Id);
  });

  it('should remove existing items', () => {
    const {id: topic1Id, activeMapItem: mapItem1} = createActiveMapItemMock('topicOne');
    const {id: topic2Id, activeMapItem: mapItem2} = createActiveMapItemMock('topicTwo');
    const {id: topic3Id, activeMapItem: mapItem3} = createActiveMapItemMock('topicThree');

    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);

    expect(mapMock.layers.length).toBe(3);

    service.removeMapItem(topic2Id);

    expect(mapMock.layers.length).toBe(2);
    expect(mapMock.layers.some((l) => l.id === topic1Id)).toBeTrue();
    expect(mapMock.layers.some((l) => l.id === topic2Id)).toBeFalse();
    expect(mapMock.layers.some((l) => l.id === topic3Id)).toBeTrue();
  });

  it('should remove all existing items', () => {
    const {activeMapItem: mapItem1} = createActiveMapItemMock('topicOne');
    const {activeMapItem: mapItem2} = createActiveMapItemMock('topicTwo');
    const {activeMapItem: mapItem3} = createActiveMapItemMock('topicThree');

    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);

    expect(mapMock.layers.length).toBe(3);

    service.removeAllMapItems();

    expect(mapMock.layers.length).toBe(0);
  });

  it('should reorder existing items to the desired position', () => {
    const {id: topic1Id, activeMapItem: mapItem1} = createActiveMapItemMock('topicOne');
    const {id: topic2Id, activeMapItem: mapItem2} = createActiveMapItemMock('topicTwo');
    const {id: topic3Id, activeMapItem: mapItem3} = createActiveMapItemMock('topicThree');

    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);
    // order: mapItem1, mapItem2, mapItem3

    service.reorderMapItem(0, 0);
    // order: mapItem2, mapItem1, mapItem3 (no change)

    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(topic3Id);
    expect(mapMock.layers.getItemAt(1).id).toBe(topic2Id);
    expect(mapMock.layers.getItemAt(2).id).toBe(topic1Id);

    service.reorderMapItem(0, 1);
    // order: mapItem2, mapItem1, mapItem3

    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(topic3Id);
    expect(mapMock.layers.getItemAt(1).id).toBe(topic1Id);
    expect(mapMock.layers.getItemAt(2).id).toBe(topic2Id);
  });

  it('should reorder sublayers from existing items to the desired position', () => {
    const {activeMapItem: mapItem} = createActiveMapItemMock('topic', 3);

    service.addMapItem(mapItem, 0);
    const wmsLayer = mapMock.layers.getItemAt(0) as __esri.WMSLayer;

    expect(wmsLayer.sublayers.getItemAt(0).id).toBe(0);
    expect(wmsLayer.sublayers.getItemAt(1).id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(2).id).toBe(2);

    service.reorderSublayer(mapItem, 0, 0);

    expect(wmsLayer.sublayers.getItemAt(0).id).toBe(0);
    expect(wmsLayer.sublayers.getItemAt(1).id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(2).id).toBe(2);

    service.reorderSublayer(mapItem, 0, 1);

    expect(wmsLayer.sublayers.getItemAt(0).id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(1).id).toBe(0);
    expect(wmsLayer.sublayers.getItemAt(2).id).toBe(2);
  });
});
