import {TestBed} from '@angular/core/testing';
import {EsriMapService} from './esri-map.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
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
import {selectMapConfigState} from 'src/app/state/map/reducers/map-config.reducer';
import {selectActiveTool} from 'src/app/state/map/reducers/tool.reducer';
import {selectAllItems} from 'src/app/state/map/selectors/active-map-items.selector';
import {selectDrawings} from 'src/app/state/map/reducers/drawing.reducer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Layer from '@arcgis/core/layers/Layer';
import {defaultMapConfig} from 'src/app/shared/configs/map.config';
import {DrawingActiveMapItem} from '../../models/implementations/drawing.model';
import {Gb3StyledInternalDrawingRepresentation} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {HasSrs} from 'src/app/shared/interfaces/geojson-types-with-srs.interface';
import {Point} from 'geojson';
import {MapConfigActions} from 'src/app/state/map/actions/map-config.actions';
import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {InitialMapExtentService} from '../initial-map-extent.service';
import EsriPoint from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';

function compareMapItemToEsriLayer(expectedMapItem: Gb2WmsActiveMapItem, actualEsriLayer: Layer) {
  expect(actualEsriLayer.id).toBe(expectedMapItem.id);
  expect(actualEsriLayer.opacity).toBe(expectedMapItem.opacity);
  expect(actualEsriLayer.title).toBe(expectedMapItem.title);
  expect(actualEsriLayer.visible).toBe(expectedMapItem.visible);

  const actualEsriWmsLayer = actualEsriLayer as WMSLayer;
  expect(actualEsriWmsLayer.url).toBe(expectedMapItem.settings.url);
  expect(actualEsriWmsLayer.sublayers.length).toBe(expectedMapItem.settings.layers.length);
  expectedMapItem.settings.layers.forEach((expectedLayer) => {
    const actualEsriSublayer = actualEsriWmsLayer.sublayers.find((sl) => sl.id === expectedLayer.id);
    expect(actualEsriSublayer).toBeDefined();
    expect(actualEsriSublayer!.name).toBe(expectedLayer.layer);
    expect(actualEsriSublayer!.title).toBe(expectedLayer.title);
    expect(actualEsriSublayer!.visible).toBe(expectedLayer.visible);
  });
}

const mockAuthService: Partial<AuthService> = {
  logout: vi.fn().mockReturnValue(void 0),
  getAccessToken: vi.fn().mockReturnValue(void 0),
  login: vi.fn().mockReturnValue(void 0),
};

const internalLayerPrefix = DrawingLayerPrefix.Internal;
const internalLayers = Object.values(InternalDrawingLayer).map(
  (drawingLayer) =>
    new GraphicsLayer({
      id: `${internalLayerPrefix}${drawingLayer}`,
    }),
);

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
  let toolServiceSpy: EsriToolService;
  let mapViewService: EsriMapViewService = new EsriMapViewService();
  let initialMapExtentService: InitialMapExtentService;
  let store: MockStore;
  let mapViewMock: MapView;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [
        provideMockStore({
          initialState: {
            activeMapItem: {
              items: [],
            },
          },
        }),
        {provide: AuthService, useValue: mockAuthService},
        {
          provide: EsriMapViewService,
          useValue: mapViewService,
        },
      ],
    });

    // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
    mapMock = new EsriMapMock(internalLayers);
    mapViewService = TestBed.inject(EsriMapViewService);
    mapViewMock = {
      map: mapMock,
      zoom: 0,
      scale: 0,
      center: new EsriPoint({x: -1, y: -1, spatialReference: new SpatialReference({wkid: 2056})}),
    } as MapView;
    mapViewService.mapView.set(mapViewMock);
    store = TestBed.inject(MockStore);
    toolServiceSpy = TestBed.inject(EsriToolService);
    initialMapExtentService = TestBed.inject(InitialMapExtentService);
    vi.spyOn(toolServiceSpy, 'initializeMeasurement').mockImplementation(vi.fn());
    vi.spyOn(toolServiceSpy, 'addExistingDrawingsToLayer').mockImplementation(vi.fn());
  });

  it('should be created', () => {
    service = TestBed.inject(EsriMapService);
    expect(service).toBeTruthy();
  });

  it('should init and deinit correctly', async () => {
    vi.useFakeTimers();

    store.overrideSelector(selectMapConfigState, {
      ...defaultMapConfig,
      isMapServiceInitialized: false,
      center: {
        x: 1408,
        y: 1337,
      },
      scale: 12,
      rotation: 34,
      srsId: 2056,
      ready: true,
    });
    store.refreshState();

    await vi.runAllTimersAsync();

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    service = TestBed.inject(EsriMapService);
    service.assignMapElement(document.createElement('div'));

    await vi.runAllTimersAsync();

    expect(service.mapContainerElement()).not.toBeNull();
    expect(service.mapInitialized()).toBeTruthy();
    expect(mapViewService.mapView()).toBeTruthy();

    service.deInit();

    await vi.runAllTimersAsync();

    expect(dispatchSpy).toHaveBeenCalledWith(MapConfigActions.markMapServiceAsDeinitialized());
    expect(service.mapContainerElement()).toBeNull();
    expect(service.mapInitialized()).toBeFalsy();
    expect(mapViewService.mapView()).toBeUndefined();
  });

  it('should initialize the map with config and add drawings on init', async () => {
    vi.useFakeTimers();

    const mockUserDrawing: Gb3StyledInternalDrawingRepresentation = {
      source: UserDrawingLayer.Drawings,
      geometry: {
        type: 'Point',
        coordinates: [1, 2],
        srs: 2056,
      } as Point & HasSrs,
      type: 'Feature',
      properties: {
        style: {
          type: 'point',
          strokeColor: '#ff6600',
          strokeOpacity: 1,
          strokeWidth: 12,
          fillColor: '#ff6600',
          fillOpacity: 0.5,
          pointRadius: 34,
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __id: '',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __belongsTo: undefined,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __tool: 'point',
      },
    };

    const mockSearchHighlightDrawing = {
      ...mockUserDrawing,
      source: InternalDrawingLayer.FeatureHighlight,
    };

    const mockDrawings: Gb3StyledInternalDrawingRepresentation[] = [mockUserDrawing, mockSearchHighlightDrawing];

    store.overrideSelector(selectDrawings, mockDrawings);
    store.overrideSelector(selectActiveTool, 'draw-point');
    store.overrideSelector(selectMapConfigState, {
      ...defaultMapConfig,
      isMapServiceInitialized: false,
      center: {
        x: 1408,
        y: 1337,
      },
      scale: 12,
      rotation: 34,
      srsId: 2056,
      ready: true,
    });
    store.overrideSelector(selectAllItems, [
      new DrawingActiveMapItem('some-item', DrawingLayerPrefix.Drawing, UserDrawingLayer.Drawings, true, 1),
    ]);
    store.refreshState();
    service = TestBed.inject(EsriMapService);
    service.assignMapElement(document.createElement('div'));

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await vi.runAllTimersAsync();

    expect(service.getMapView().scale).toBe(12);
    expect(service.getMapView().center.x).toBe(1408);
    expect(service.getMapView().center.y).toBe(1337);
    expect(toolServiceSpy.addExistingDrawingsToLayer).toHaveBeenCalledWith([mockUserDrawing], UserDrawingLayer.Drawings);
    expect(dispatchSpy).toHaveBeenCalledWith(MapConfigActions.markMapServiceAsInitialized());

    vi.useRealTimers();
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
    service = TestBed.inject(EsriMapService);
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));
    // index <> position; position 0 should be the highest index for Esri.
    compareMapItemToEsriLayer(mapItem1, mapMock.layers.getItemAt(2)!);
    compareMapItemToEsriLayer(mapItem2, mapMock.layers.getItemAt(1)!);
    compareMapItemToEsriLayer(mapItem3, mapMock.layers.getItemAt(0)!);

    service.removeAllMapItems();
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 0);
    service.addGb2WmsLayer(mapItem3, 0);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));
    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0)!.id).toBe(mapItem1.id);
    expect(mapMock.layers.getItemAt(1)!.id).toBe(mapItem2.id);
    expect(mapMock.layers.getItemAt(2)!.id).toBe(mapItem3.id);
    internalLayers.forEach((fixedLayer, idx) => {
      // assert that fixed layers are not changed
      // note: internal layers are at the end of all layers
      const internalLayerIndex = mapMock.layers.length - internalLayers.length + idx;
      expect(mapMock.layers.getItemAt(internalLayerIndex)!.id).toBe(fixedLayer.id);
    });
  });

  it('should remove an existing item', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    const mapItem2 = createGb2WmsMapItemMock('mapTwo');
    const mapItem3 = createGb2WmsMapItemMock('mapThree');
    service = TestBed.inject(EsriMapService);
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3));

    service.removeMapItem(mapItem2.id);

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(2));
    expect(mapMock.layers.some((l) => l.id === mapItem1.id)).toBe(true);
    expect(mapMock.layers.some((l) => l.id === mapItem2.id)).toBe(false);
    expect(mapMock.layers.some((l) => l.id === mapItem3.id)).toBe(true);
    internalLayers.forEach((fixedLayer) => {
      expect(mapMock.layers.some((l) => l.id === fixedLayer.id)).toBe(true);
    });
  });

  it('should remove all existing items without internal layers - those must be cleared instead', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    const mapItem2 = createGb2WmsMapItemMock('mapTwo');
    const mapItem3 = createGb2WmsMapItemMock('mapThree');
    service = TestBed.inject(EsriMapService);
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);

    const userDrawingLayerIds = Object.values(UserDrawingLayer).map((drawingLayer) => createDrawingMapItemMock(drawingLayer).id);
    mapMock.layers.addMany(userDrawingLayerIds.map((id) => new GraphicsLayer({id})));
    const internalLayerSpies = internalLayers.map((internalLayer) => vi.spyOn(internalLayer, 'removeAll'));

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(3 + userDrawingLayerIds.length));

    service.removeAllMapItems();

    expect(mapMock.layers.length).toBe(getExpectedNumberOfLayersWithInternalLayers(0));
    internalLayers.forEach((internalLayer) => {
      expect(mapMock.layers.some((l) => l.id === internalLayer.id)).toBe(true);
    });
    internalLayerSpies.forEach((internalLayerSpy) => {
      expect(internalLayerSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('should reorder existing items to the desired position', () => {
    const mapItem1 = createGb2WmsMapItemMock('mapOne');
    const mapItem2 = createGb2WmsMapItemMock('mapTwo');
    const mapItem3 = createGb2WmsMapItemMock('mapThree');
    service = TestBed.inject(EsriMapService);
    service.addGb2WmsLayer(mapItem1, 0);
    service.addGb2WmsLayer(mapItem2, 1);
    service.addGb2WmsLayer(mapItem3, 2);
    // order: mapItem1, mapItem2, mapItem3

    service.reorderMapItem(0, 0);
    // order: mapItem2, mapItem1, mapItem3 (no change)

    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0)!.id).toBe(mapItem3.id);
    expect(mapMock.layers.getItemAt(1)!.id).toBe(mapItem2.id);
    expect(mapMock.layers.getItemAt(2)!.id).toBe(mapItem1.id);

    service.reorderMapItem(0, 1);
    // order: mapItem2, mapItem1, mapItem3

    // index <> position; position 0 should be the highest index for Esri.
    expect(mapMock.layers.getItemAt(0)!.id).toBe(mapItem3.id);
    expect(mapMock.layers.getItemAt(1)!.id).toBe(mapItem1.id);
    expect(mapMock.layers.getItemAt(2)!.id).toBe(mapItem2.id);
    internalLayers.forEach((fixedLayer, idx) => {
      // assert that fixed layers are not changed
      // note: internal layers are at the end of all layers
      const internalLayerIndex = mapMock.layers.length - internalLayers.length + idx;
      expect(mapMock.layers.getItemAt(internalLayerIndex)!.id).toBe(fixedLayer.id);
    });
  });

  it('should reorder sublayers from existing items to the desired position', () => {
    const mapItem = createGb2WmsMapItemMock('topic', 3);
    service = TestBed.inject(EsriMapService);
    service.addGb2WmsLayer(mapItem, 0);
    const wmsLayer = mapMock.layers.getItemAt(0) as WMSLayer;
    // order: layer2, layer1, layer0

    // index <> position; position 0 should be the highest index for Esri.
    expect(wmsLayer.sublayers.getItemAt(0)!.id).toBe(2);
    expect(wmsLayer.sublayers.getItemAt(1)!.id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(2)!.id).toBe(0);

    service.reorderSublayer(mapItem, 0, 0);
    // order: layer2, layer1, layer0

    // index <> position; position 0 should be the highest index for Esri.
    expect(wmsLayer.sublayers.getItemAt(0)!.id).toBe(2);
    expect(wmsLayer.sublayers.getItemAt(1)!.id).toBe(1);
    expect(wmsLayer.sublayers.getItemAt(2)!.id).toBe(0);

    service.reorderSublayer(mapItem, 0, 1);
    // order: layer2, layer0, layer1

    // index <> position; position 0 should be the highest index for Esri.
    expect(wmsLayer.sublayers.getItemAt(0)!.id).toBe(2);
    expect(wmsLayer.sublayers.getItemAt(1)!.id).toBe(0);
    expect(wmsLayer.sublayers.getItemAt(2)!.id).toBe(1);
  });

  describe('clearInternalDrawingLayer', () => {
    it('clear all geometries from an internal layers', () => {
      for (const internalDrawingLayerKey in InternalDrawingLayer) {
        const internalDrawingLayer: InternalDrawingLayer =
          InternalDrawingLayer[internalDrawingLayerKey as keyof typeof InternalDrawingLayer];
        const internalLayer = internalLayers.find((layer) => layer.id === `${internalLayerPrefix}${internalDrawingLayer}`);

        expect(internalLayer).toBeDefined();

        const internalLayerSpy = vi.spyOn(internalLayer as GraphicsLayer, 'removeAll');
        service = TestBed.inject(EsriMapService);
        service.clearInternalDrawingLayer(internalDrawingLayer);

        expect(internalLayerSpy).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('removeGeometryFromInternalDrawingLayer', () => {
    it('should remove a given geometry from an internal drawing layer', () => {
      const internalDrawingLayer: InternalDrawingLayer = InternalDrawingLayer.SearchResultHighlight;
      const internalLayer = internalLayers.find((layer) => layer.id === `${internalLayerPrefix}${internalDrawingLayer}`);

      expect(internalLayer).toBeDefined();

      const graphic = new Graphic({
        attributes: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          __id: 'asdf',
        },
      });

      internalLayer!.add(graphic);

      const internalLayerSpy = vi.spyOn(internalLayer as GraphicsLayer, 'removeMany');

      service = TestBed.inject(EsriMapService);
      service.removeGeometryFromInternalDrawingLayer(InternalDrawingLayer.SearchResultHighlight, 'asdf');
      expect(internalLayerSpy).toHaveBeenCalledWith([graphic]);
    });
  });

  describe('moveLayerToTop', () => {
    it('should not do anything if esri layer is not found', () => {
      const reorderSpy = vi.spyOn(mapMock, 'reorder');
      const findEsriLayerSpy = vi.spyOn(mapViewService, 'findEsriLayer').mockReturnValue(undefined);
      service = TestBed.inject(EsriMapService);
      service.moveLayerToTop({id: 'asdf'} as ActiveMapItem);

      expect(findEsriLayerSpy).toHaveBeenCalledWith('asdf');
      expect(reorderSpy).not.toHaveBeenCalled();
    });

    it('should attempt to reorder if a layer was found', () => {
      const mockLayer = {id: 'asdf'} as Layer;
      const reorderSpy = vi.spyOn(mapMock.layers, 'reorder');
      const findEsriLayerSpy = vi.spyOn(mapViewService, 'findEsriLayer').mockReturnValue(mockLayer);
      service = TestBed.inject(EsriMapService);
      service.moveLayerToTop({id: 'asdf'} as ActiveMapItem);
      expect(findEsriLayerSpy).toHaveBeenCalledWith('asdf');
      expect(reorderSpy).toHaveBeenCalledWith(mockLayer, -1);
    });
  });

  describe('handleZoom', () => {
    it('should not zoom in if current zoom level already is too small', () => {
      mapViewMock.zoom = 3000;
      service = TestBed.inject(EsriMapService);
      service.handleZoom('zoomIn');
      expect(mapViewMock.zoom).toBe(3000);
    });

    it('should zoom in if the zoom level is still small enough', () => {
      expect(mapViewMock.zoom).toBe(0);
      service = TestBed.inject(EsriMapService);
      service.handleZoom('zoomIn');
      expect(mapViewMock.zoom).toBe(1);
    });

    it('should zoom out if the zoom level large enough', () => {
      expect(mapViewMock.zoom).toBe(0);
      service = TestBed.inject(EsriMapService);
      service.handleZoom('zoomOut');
      expect(mapViewMock.zoom).toBe(-1);
    });

    it('should not zoom out if the zoom level is too small', () => {
      mapViewMock.zoom = -2;
      mapViewMock.scale = 3000;
      service = TestBed.inject(EsriMapService);
      service.handleZoom('zoomOut');
      expect(mapViewMock.zoom).toBe(-2);
    });

    it('should not zoom out if the scale level is too large', () => {
      mapViewMock.zoom = -2;
      mapViewMock.scale = 3000;
      service = TestBed.inject(EsriMapService);
      service.handleZoom('zoomOut');
      expect(mapViewMock.zoom).toBe(-2);
    });
  });

  describe('setScale', () => {
    it('should set the scale correcly', () => {
      expect(mapViewMock.scale).toBe(0);
      service = TestBed.inject(EsriMapService);
      service.setScale(3000);
      expect(mapViewMock.scale).toBe(3000);
    });
  });

  describe('resetExtent', () => {
    it('should reset the extent correctly', () => {
      vi.spyOn(initialMapExtentService, 'calculateInitialExtent').mockReturnValue({x: 12, y: 13, scale: 14});
      service = TestBed.inject(EsriMapService);
      service.resetExtent();
      expect(mapViewMock.center.x).toBe(12);
      expect(mapViewMock.center.y).toBe(13);
      expect(mapViewMock.scale).toBe(14);
    });
  });
});
