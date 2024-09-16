import {TestBed} from '@angular/core/testing';

import {EsriMapService} from './esri-map.service';
import {provideMockStore} from '@ngrx/store/testing';
import {EsriMapMock} from '../../../testing/map-testing/esri-map.mock';
import {AuthModule} from '../../../auth/auth.module';
import {AuthService} from '../../../auth/auth.service';
import {DrawingLayerPrefix, InternalDrawingLayer, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {EsriMapViewService} from './esri-map-view.service';
import {EsriToolService} from './tool-service/esri-tool.service';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {FilterConfiguration} from '../../../shared/interfaces/topic.interface';
import {TIME_SERVICE} from '../../../app.module';
import {DayjsTimeService} from '../../../shared/services/dayjs-time.service';

function compareMapItemToEsriLayer(expectedMapItem: Gb2WmsActiveMapItem, actualEsriLayer: __esri.Layer) {
  expect(actualEsriLayer.id).toBe(expectedMapItem.id);
  expect(actualEsriLayer.opacity).toBe(expectedMapItem.opacity);
  expect(actualEsriLayer.title).toBe(expectedMapItem.title);
  expect(actualEsriLayer.visible).toBe(expectedMapItem.visible);

  const actualEsriWmsLayer = actualEsriLayer as __esri.WMSLayer;
  expect(actualEsriWmsLayer.url).toBe(expectedMapItem.settings.url);
  expect(actualEsriWmsLayer.sublayers.length).toBe(expectedMapItem.settings.layers.length);
  expectedMapItem.settings.layers.forEach((expectedLayer) => {
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
});

const internalLayerPrefix = DrawingLayerPrefix.Internal;
const internalLayers = Object.values(InternalDrawingLayer).map((drawingLayer) => {
  return new GraphicsLayer({
    id: `${internalLayerPrefix}${drawingLayer}`,
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
  let mapViewService: EsriMapViewService = new EsriMapViewService();

  beforeEach(() => {
    const toolServiceSpy = jasmine.createSpyObj<EsriToolService>(['initializeMeasurement']);

    TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [
        provideMockStore({}),
        {provide: AuthService, useValue: mockAuthService},
        {
          provide: EsriMapViewService,
          useValue: mapViewService,
        },
        {
          provide: EsriToolService,
          useValue: toolServiceSpy,
        },
        {provide: TIME_SERVICE, useClass: DayjsTimeService},
      ],
    });
    service = TestBed.inject(EsriMapService);
    TestBed.inject(EsriToolService);

    // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
    mapMock = new EsriMapMock(internalLayers);
    mapViewService = TestBed.inject(EsriMapViewService);
    mapViewService.mapView = {map: mapMock} as __esri.MapView;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add new items to the desired position', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    mapItem1.opacity = 0.5;
    mapItem1.visible = false;
    const mapItem2 = createGb2WmsMapItemMock('mapTwo', 2);
    mapItem2.settings.layers[0].visible = false;
    const attributeFilters: FilterConfiguration[] = [
      {
        name: 'Anzeigeoptionen nach Hauptnutzung',
        parameter: 'FILTER_GEBART',
        filterValues: [
          {
            isActive: true,
            values: ['Gebäude Wohnen'],
            name: 'Wohnen',
          },
          {
            isActive: false,
            values: ['Gebäude Wohnen'],
            name: 'Gewerbe und Verwaltung',
          },
          {
            isActive: false,
            values: ['Gebäude Wohnen'],
            name: 'Andere',
          },
        ],
      },
    ];
    const mapItem3 = createGb2WmsMapItemMock('mapThree', 1, true, 1, '123', false, undefined, attributeFilters);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(0));

    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));
    // index <> position; position 0 should be the highest index for Esri.
    compareMapItemToEsriLayer(mapItem1, mapMock.layers.getItemAt(2));
    compareMapItemToEsriLayer(mapItem2, mapMock.layers.getItemAt(1));
    compareMapItemToEsriLayer(mapItem3, mapMock.layers.getItemAt(0));

    service.removeAllMapItems();
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 0);
    service.addGb2WmsLayer(mapItem3, 0);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));
    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(mapItem1.id);
    expect(mapMock.layers.getItemAt(1).id).toBe(mapItem2.id);
    expect(mapMock.layers.getItemAt(2).id).toBe(mapItem3.id);
    internalLayers.forEach((fixedLayer, idx) => {
      // assert that fixed layers are not changed
      // note: internal layers are at the end of all layers
      const internalLayerIndex = mapMock.layers.length - internalLayers.length + idx;
      expect(mapMock.layers.getItemAt(internalLayerIndex).id).toBe(fixedLayer.id);
    });
  });

  it('should remove an existing item', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    const mapItem2 = createGb2WmsMapItemMock('mapTwo');
    const mapItem3 = createGb2WmsMapItemMock('mapThree');
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));

    service.removeMapItem(mapItem2.id);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(2));
    expect(mapMock.layers.some((l) => l.id === mapItem1.id)).toBeTrue();
    expect(mapMock.layers.some((l) => l.id === mapItem2.id)).toBeFalse();
    expect(mapMock.layers.some((l) => l.id === mapItem3.id)).toBeTrue();
    internalLayers.forEach((fixedLayer) => {
      expect(mapMock.layers.some((l) => l.id === fixedLayer.id)).toBeTrue();
    });
  });

  it('should remove all existing items without internal layers - those must be cleared instead', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    const mapItem2 = createGb2WmsMapItemMock('mapTwo');
    const mapItem3 = createGb2WmsMapItemMock('mapThree');

    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);

    const userDrawingLayerIds = Object.values(UserDrawingLayer).map((drawingLayer) => createDrawingMapItemMock(drawingLayer).id);
    mapMock.layers.addMany(userDrawingLayerIds.map((id) => new GraphicsLayer({id})));
    const internalLayerSpies = internalLayers.map((internalLayer) => spyOn(internalLayer, 'removeAll').and.callThrough());

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3 + userDrawingLayerIds.length));

    service.removeAllMapItems();

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(0));
    internalLayers.forEach((internalLayer) => {
      expect(mapMock.layers.some((l) => l.id === internalLayer.id)).toBeTrue();
    });
    internalLayerSpies.forEach((internalLayerSpy) => {
      expect(internalLayerSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should reorder existing items to the desired position', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    const mapItem2 = createGb2WmsMapItemMock('mapTwo');
    const mapItem3 = createGb2WmsMapItemMock('mapThree');

    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);
    // order: mapItem1, mapItem2, mapItem3

    service.reorderMapItem(0, 0);
    // order: mapItem2, mapItem1, mapItem3 (no change)

    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(mapItem3.id);
    expect(mapMock.layers.getItemAt(1).id).toBe(mapItem2.id);
    expect(mapMock.layers.getItemAt(2).id).toBe(mapItem1.id);

    service.reorderMapItem(0, 1);
    // order: mapItem2, mapItem1, mapItem3

    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0).id).toBe(mapItem3.id);
    expect(mapMock.layers.getItemAt(1).id).toBe(mapItem1.id);
    expect(mapMock.layers.getItemAt(2).id).toBe(mapItem2.id);
    internalLayers.forEach((fixedLayer, idx) => {
      // assert that fixed layers are not changed
      // note: internal layers are at the end of all layers
      const internalLayerIndex = mapMock.layers.length - internalLayers.length + idx;
      expect(mapMock.layers.getItemAt(internalLayerIndex).id).toBe(fixedLayer.id);
    });
  });

  it('should reorder sublayers from existing items to the desired position', () => {
    const mapItem = createGb2WmsMapItemMock('topic', 3);

    service.addGb2WmsLayer(mapItem, 0);
    const wmsLayer = mapMock.layers.getItemAt(0) as __esri.WMSLayer;
    // order: layer2, layer1, layer0

    // index <> position; position 0 should be the highest index for Esri.
    expect(wmsLayer.sublayers.getItemAt(0).id).toBe(2);
    expect(wmsLayer.sublayers.getItemAt(1).id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(2).id).toBe(0);

    service.reorderSublayer(mapItem, 0, 0);
    // order: layer2, layer1, layer0

    // index <> position; position 0 should be the highest index for Esri.
    expect(wmsLayer.sublayers.getItemAt(0).id).toBe(2);
    expect(wmsLayer.sublayers.getItemAt(1).id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(2).id).toBe(0);

    service.reorderSublayer(mapItem, 0, 1);
    // order: layer2, layer0, layer1

    // index <> position; position 0 should be the highest index for Esri.
    expect(wmsLayer.sublayers.getItemAt(0).id).toBe(2);
    expect(wmsLayer.sublayers.getItemAt(1).id).toBe(0);
    expect(wmsLayer.sublayers.getItemAt(2).id).toBe(1);
  });

  describe('clearInternalDrawingLayer', () => {
    it('clear all geometries from an internal layers', () => {
      for (const internalDrawingLayerKey in InternalDrawingLayer) {
        const internalDrawingLayer: InternalDrawingLayer =
          InternalDrawingLayer[internalDrawingLayerKey as keyof typeof InternalDrawingLayer];
        const internalLayer = internalLayers.find((layer) => layer.id === `${internalLayerPrefix}${internalDrawingLayer}`);

        expect(internalLayer).toBeDefined();

        const internalLayerSpy = spyOn(internalLayer as __esri.GraphicsLayer, 'removeAll').and.callThrough();
        service.clearInternalDrawingLayer(internalDrawingLayer);

        expect(internalLayerSpy).toHaveBeenCalledTimes(1);
      }
    });
  });
});
