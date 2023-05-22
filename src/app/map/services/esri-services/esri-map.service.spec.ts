import {TestBed} from '@angular/core/testing';

import {EsriMapService} from './esri-map.service';
import {provideMockStore} from '@ngrx/store/testing';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Map, MapLayer} from '../../../shared/interfaces/topic.interface';
import {EsriMapMock} from '../../../testing/map-testing/esri-map.mock';
import {AuthModule} from '../../../auth/auth.module';
import {AuthService} from '../../../auth/auth.service';
import {Subject} from 'rxjs';
import {DrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {MapConstants} from '../../../shared/constants/map.constants';

function createActiveMapItemMock(id: string, numberOfLayers = 0): {id: string; activeMapItem: ActiveMapItem} {
  const mapMock = {id: id, title: id, layers: []} as Partial<Map>;
  for (let layerNumber = 0; layerNumber < numberOfLayers; layerNumber++) {
    const uniqueLayerName = `layer${layerNumber}_${id}`;
    const layerMock = {layer: uniqueLayerName, title: uniqueLayerName, id: layerNumber, visible: true} as Partial<MapLayer>;
    mapMock.layers?.push(<MapLayer>layerMock);
  }
  return {id: id, activeMapItem: new ActiveMapItem(<Map>mapMock)};
}

function compareMapItemToEsriLayer(expectedMapItem: ActiveMapItem, actualEsriLayer: __esri.Layer) {
  expect(actualEsriLayer.id).toBe(expectedMapItem.id);
  expect(actualEsriLayer.opacity).toBe(expectedMapItem.opacity);
  expect(actualEsriLayer.title).toBe(expectedMapItem.title);
  expect(actualEsriLayer.visible).toBe(expectedMapItem.visible);

  const actualEsriWmsLayer = actualEsriLayer as __esri.WMSLayer;
  expect(actualEsriWmsLayer.url).toBe(expectedMapItem.url);
  expect(actualEsriWmsLayer.sublayers.length).toBe(expectedMapItem.layers.length);
  expectedMapItem.layers.forEach((expectedLayer) => {
    const actualEsriSublayer = actualEsriWmsLayer.sublayers.find((sl) => sl.id === expectedLayer.id);
    expect(actualEsriSublayer).toBeDefined();
    expect(actualEsriSublayer.name).toBe(expectedLayer.layer);
    expect(actualEsriSublayer.title).toBe(expectedLayer.title);
    expect(actualEsriSublayer.visible).toBe(expectedLayer.visible);
  });
}

const mockAuthService = jasmine.createSpyObj<AuthService>({
  logout: void 0,
  getAccessToken: void 0,
  login: void 0,
  isAuthenticated$: new Subject<boolean>().asObservable()
});

const internalLayerPrefix = MapConstants.INTERNAL_LAYER_PREFIX;
const internalLayers = Object.values(DrawingLayer).map((drawingLayer) => {
  return new GraphicsLayer({
    id: `${internalLayerPrefix}${drawingLayer}`
  });
});

/**
 * Helper function that wraps the expected number of layers with the fixed layers. This helps to test the logic that
 * there might be fixed layers that are not affected by any changes.
 * @param expectedNumber
 */
function getExpectedNumberOfLayersWithInternalLayers(expectedNumber: number): number {
  return internalLayers.length + expectedNumber;
}

describe('EsriMapService', () => {
  let service: EsriMapService;
  let mapMock: EsriMapMock;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [provideMockStore({}), {provide: AuthService, useValue: mockAuthService}]
    });
    service = TestBed.inject(EsriMapService);
    // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
    mapMock = new EsriMapMock(internalLayers);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['_mapView'] = {map: mapMock} as __esri.MapView;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add new items to the desired position', () => {
    const {id: topic1Id, activeMapItem: mapItem1} = createActiveMapItemMock('mapOne');
    mapItem1.opacity = 0.5;
    mapItem1.visible = false;
    const {id: topic2Id, activeMapItem: mapItem2} = createActiveMapItemMock('mapTwo', 2);
    mapItem2.layers[0].visible = false;
    const {id: topic3Id, activeMapItem: mapItem3} = createActiveMapItemMock('mapThree');

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(0));

    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));
    // index <> position; position 0 should be the highest index for Esri.
    compareMapItemToEsriLayer(mapItem1, mapMock.layers.getItemAt(2));
    compareMapItemToEsriLayer(mapItem2, mapMock.layers.getItemAt(1));
    compareMapItemToEsriLayer(mapItem3, mapMock.layers.getItemAt(0));

    service.removeAllMapItems();
    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 0);
    service.addMapItem(mapItem3, 0);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));
    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(topic1Id);
    expect(mapMock.layers.getItemAt(1).id).toBe(topic2Id);
    expect(mapMock.layers.getItemAt(2).id).toBe(topic3Id);
    internalLayers.forEach((fixedLayer, idx) => {
      // assert that fixed layers are not changed
      expect(mapMock.layers.getItemAt(getExpectedNumberOfLayersWithInternalLayers(idx)).id).toBe(fixedLayer.id);
    });
  });

  it('should remove an existing item', () => {
    const {id: topic1Id, activeMapItem: mapItem1} = createActiveMapItemMock('mapOne');
    const {id: topic2Id, activeMapItem: mapItem2} = createActiveMapItemMock('mapTwo');
    const {id: topic3Id, activeMapItem: mapItem3} = createActiveMapItemMock('mapThree');
    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));

    service.removeMapItem(topic2Id);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(2));
    expect(mapMock.layers.some((l) => l.id === topic1Id)).toBeTrue();
    expect(mapMock.layers.some((l) => l.id === topic2Id)).toBeFalse();
    expect(mapMock.layers.some((l) => l.id === topic3Id)).toBeTrue();
    internalLayers.forEach((fixedLayer) => {
      expect(mapMock.layers.some((l) => l.id === fixedLayer.id)).toBeTrue();
    });
  });

  it('should remove all existing items without fixed layers', () => {
    const {activeMapItem: mapItem1} = createActiveMapItemMock('mapOne');
    const {activeMapItem: mapItem2} = createActiveMapItemMock('mapTwo');
    const {activeMapItem: mapItem3} = createActiveMapItemMock('mapThree');

    service.addMapItem(mapItem1, 0);
    service.addMapItem(mapItem2, 1);
    service.addMapItem(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));

    service.removeAllMapItems();

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(0));
    internalLayers.forEach((fixedLayer) => {
      expect(mapMock.layers.some((l) => l.id === fixedLayer.id)).toBeTrue();
    });
  });

  it('should reorder existing items to the desired position', () => {
    const {id: topic1Id, activeMapItem: mapItem1} = createActiveMapItemMock('mapOne');
    const {id: topic2Id, activeMapItem: mapItem2} = createActiveMapItemMock('mapTwo');
    const {id: topic3Id, activeMapItem: mapItem3} = createActiveMapItemMock('mapThree');

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
    internalLayers.forEach((fixedLayer, idx) => {
      // assert that fixed layers are not changed
      expect(mapMock.layers.getItemAt(getExpectedNumberOfLayersWithInternalLayers(idx)).id).toBe(fixedLayer.id);
    });
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
