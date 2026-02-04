/*
  eslint-disable
  @typescript-eslint/dot-notation,
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unused-vars,
 */
import {fakeAsync, flushMicrotasks, TestBed} from '@angular/core/testing';
import {EsriToolService, HANDLE_GROUP_KEY} from './esri-tool.service';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectDrawingLayers} from '../../../../state/map/selectors/drawing-layers.selector';
import {EsriMapMock} from '../../../../testing/map-testing/esri-map.mock';
import {EsriMapViewService} from '../esri-map-view.service';
import {EsriPointMeasurementStrategy} from './strategies/measurement/esri-point-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {DrawingLayerPrefix, InternalDrawingLayer, UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../../models/implementations/drawing.model';
import {EsriLineMeasurementStrategy} from './strategies/measurement/esri-line-measurement.strategy';
import {EsriAreaMeasurementStrategy} from './strategies/measurement/esri-area-measurement.strategy';
import {take, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItemFactory} from '../../../../shared/factories/active-map-item.factory';
import {MapConstants} from '../../../../shared/constants/map.constants';
import {MatDialogModule} from '@angular/material/dialog';
import {EsriPointDrawingStrategy} from './strategies/drawing/esri-point-drawing.strategy';
import {EsriLineDrawingStrategy} from './strategies/drawing/esri-line-drawing.strategy';
import {EsriPolygonDrawingStrategy} from './strategies/drawing/esri-polygon-drawing.strategy';
import {EsriTextDrawingStrategy} from './strategies/drawing/esri-text-drawing.strategy';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {EsriElevationProfileMeasurementStrategy} from './strategies/measurement/esri-elevation-profile-measurement.strategy';
import {EsriPolygonSelectionStrategy} from './strategies/selection/esri-polygon-selection.strategy';
import {EsriScreenExtentSelectionStrategy} from './strategies/selection/esri-screen-extent-selection.strategy';
import {EsriBoundingBoxSelectionStrategy} from './strategies/selection/esri-bounding-box-selection.strategy';
import {EsriMunicipalitySelectionStrategy} from './strategies/selection/esri-municipality-selection.strategy';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Color from '@arcgis/core/Color';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';
import {EsriGraphicToInternalDrawingRepresentationUtils} from '../utils/esri-graphic-to-internal-drawing-representation.utils';
import {DataDownloadSelection} from '../../../../shared/interfaces/data-download-selection.interface';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {DrawingMode} from './types/drawing-mode.type';
import {
  Gb3StyledInternalDrawingRepresentation,
  Gb3StyleRepresentation,
} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {StyleRepresentationToEsriSymbolUtils} from '../utils/style-representation-to-esri-symbol.utils';
import {DrawingLayerNotInitialized, EditFeatureInitializationFailed, NonEditableLayerType} from '../errors/esri.errors';
import Layer from '@arcgis/core/layers/Layer';
import {EsriDefaultStrategy} from './strategies/esri-default.strategy';
import {AbstractEsriDrawableToolStrategy} from './strategies/abstract-esri-drawable-tool.strategy';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {Point} from '@arcgis/core/geometry';
import {EsriSymbolDrawingStrategy} from './strategies/drawing/esri-symbol-drawing.strategy';
import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';
import {PointWithSrs} from 'src/app/shared/interfaces/geojson-types-with-srs.interface';
import {EsriDrawingSymbolDefinition} from './strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {EsriMapDrawingSymbol} from '../types/esri-map-drawing-symbol.type';
import {InternalDrawingRepresentationToEsriGraphicUtils} from '../utils/internal-drawing-representation-to-esri-graphic.utils';
import MapView from '@arcgis/core/views/MapView';
import EsriMap from '@arcgis/core/Map';

describe('EsriToolService', () => {
  let service: EsriToolService;
  let mapMock: EsriMapMock;
  let mapViewService: EsriMapViewService = new EsriMapViewService();
  let store: MockStore;

  // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
  class EsriMapViewMock extends MapView {
    constructor(map: Partial<EsriMap>, container: HTMLDivElement) {
      super({map, container});
      this.map = map;
      this.container = container;
    }

    public override goTo(_1: __esri.GoToTarget2D, _2?: __esri.GoToOptions2D): Promise<any> {
      return Promise.resolve();
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [
        provideMockStore({selectors: [{selector: selectDrawingLayers, value: []}]}),
        {
          provide: EsriMapViewService,
          useValue: mapViewService,
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(EsriToolService);
    store = TestBed.inject(MockStore);

    TestBed.inject(EsriToolService);

    const container = document.createElement('div');

    mapMock = new EsriMapMock([]);
    mapViewService = TestBed.inject(EsriMapViewService);
    mapViewService.mapView = new EsriMapViewMock(mapMock, container);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Visibility Handling', () => {
    let userDrawingLayerId: string;
    beforeEach(() => {
      userDrawingLayerId = DrawingLayerPrefix.Drawing + UserDrawingLayer.Measurements;
    });

    it('forces visibility if layer is present by dispatching an action', () => {
      // add the graphic layer to the view to avoid the initialization
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: userDrawingLayerId,
        }),
      );
      store.overrideSelector(selectDrawingLayers, [{id: userDrawingLayerId} as DrawingActiveMapItem]);
      store.refreshState();

      service.initializeMeasurement('measure-point');

      store.scannedActions$
        .pipe(
          take(1),
          tap((lastAction) => {
            const expected = {
              activeMapItem: {id: userDrawingLayerId},
              type: ActiveMapItemActions.forceFullVisibility.type,
            };
            expect(lastAction).toEqual(expected);
          }),
        )
        .subscribe();
    });
    it('adds a new mapitem if the layer is not present', () => {
      service.initializeMeasurement('measure-point');

      store.scannedActions$
        .pipe(
          take(1),
          tap((lastAction) => {
            const expected = {
              activeMapItem: ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, DrawingLayerPrefix.Drawing),
              position: 0,
              type: ActiveMapItemActions.addActiveMapItem.type,
            };
            expect(lastAction).toEqual(expected);
          }),
        )
        .subscribe();
    });
    it('adds an Esri handle for this service group on drawing start', () => {
      // add the graphic layer to the view to avoid the initialization
      const spy = spyOn(mapViewService.mapView, 'addHandles');
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: userDrawingLayerId,
        }),
      );
      store.overrideSelector(selectDrawingLayers, [{id: userDrawingLayerId} as DrawingActiveMapItem]);
      store.refreshState();

      service.initializeMeasurement('measure-point');

      expect(spy).toHaveBeenCalledTimes(1);
      expect((spy.calls.first().args[0] as any).remove).toBeDefined(); // we know that it must be a WatchHandle
      expect(spy.calls.first().args[1]).toEqual('EsriToolService');
    });
  });

  describe('Strategy Initialization', () => {
    describe('Measurement', () => {
      beforeEach(() => {
        const userDrawingLayerId = DrawingLayerPrefix.Drawing + UserDrawingLayer.Measurements;
        // add the graphic layer to the view to avoid the initialization
        mapViewService.mapView.map.layers.add(
          new GraphicsLayer({
            id: userDrawingLayerId,
          }),
        );
        store.overrideSelector(selectDrawingLayers, [{id: userDrawingLayerId} as DrawingActiveMapItem]);
        store.refreshState();
      });
      it('sets the correct strategy for point measurement', () => {
        const pointSpy = spyOn(EsriPointMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-point');
        expect(pointSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for line measurement', () => {
        const lineSpy = spyOn(EsriLineMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-line');
        expect(lineSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for area measurement', () => {
        const polygonSpy = spyOn(EsriAreaMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-area');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for circle measurement', () => {
        const circleSpy = spyOn(EsriAreaMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-circle');
        expect(circleSpy).toHaveBeenCalled();
      });
    });

    describe('Drawing', () => {
      beforeEach(() => {
        const userDrawingLayerId = DrawingLayerPrefix.Drawing + UserDrawingLayer.Drawings;
        // add the graphic layer to the view to avoid the initialization
        mapViewService.mapView.map.layers.add(
          new GraphicsLayer({
            id: userDrawingLayerId,
          }),
        );
        store.overrideSelector(selectDrawingLayers, [{id: userDrawingLayerId} as DrawingActiveMapItem]);
        store.refreshState();
      });
      it('sets the correct strategy for point drawing', () => {
        const pointSpy = spyOn(EsriPointDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-point');
        expect(pointSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for line drawing', () => {
        const lineSpy = spyOn(EsriLineDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-line');
        expect(lineSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for polygon drawing', () => {
        const polygonSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-polygon');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for text drawing', () => {
        const polygonSpy = spyOn(EsriTextDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-text');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for rectangle drawing', () => {
        const polygonSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-rectangle');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it('sets the correct strategy for circle drawing', () => {
        const polygonSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-circle');
        expect(polygonSpy).toHaveBeenCalled();
      });
    });

    describe('DataDownloadSelection', () => {
      beforeEach(() => {
        const internalDrawingLayerId = DrawingLayerPrefix.Internal + InternalDrawingLayer.Selection;
        // add the graphic layer to the view to avoid the initialization
        mapViewService.mapView.map.layers.add(
          new GraphicsLayer({
            id: internalDrawingLayerId,
          }),
        );
        store.refreshState();
      });
      it(`sets the correct strategy for circle selection`, () => {
        const polygonSpy = spyOn(EsriPolygonSelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-circle');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for polygon selection`, () => {
        const polygonSpy = spyOn(EsriPolygonSelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-polygon');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for rectangle selection`, () => {
        const polygonSpy = spyOn(EsriPolygonSelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-rectangle');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for section selection`, () => {
        const screenExtentSpy = spyOn(EsriScreenExtentSelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-section');
        expect(screenExtentSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for federation selection`, () => {
        const federationSpy = spyOn(EsriBoundingBoxSelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-federation');
        expect(federationSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for canton selection`, () => {
        const cantonSpy = spyOn(EsriBoundingBoxSelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-canton');
        expect(cantonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for municipality selection`, () => {
        const municipalitySpy = spyOn(EsriMunicipalitySelectionStrategy.prototype, 'start');
        service.initializeDataDownloadSelection('select-municipality');
        expect(municipalitySpy).toHaveBeenCalled();
      });
    });

    describe('ElevationProfile', () => {
      beforeEach(() => {
        const elevationProfileLayerId = DrawingLayerPrefix.Internal + InternalDrawingLayer.ElevationProfile;
        // add the graphic layer to the view to avoid the initialization
        mapViewService.mapView.map.layers.add(
          new GraphicsLayer({
            id: elevationProfileLayerId,
          }),
        );
      });
      it(`sets the correct strategy for elevation profile measurement`, () => {
        const elevationSpy = spyOn(EsriElevationProfileMeasurementStrategy.prototype, 'start');
        service.initializeElevationProfileMeasurement();
        expect(elevationSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Strategy Completion', () => {
    const graphicMock = new Graphic({
      attributes: {
        [MapConstants.DRAWING_IDENTIFIER]: 'id',
      },
      geometry: new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, 69],
            [42, 0],
            [0, 0],
          ],
        ],
      }),
      symbol: new SimpleFillSymbol({
        color: new Color(Color.fromHex('#abcdef')!),
        outline: {width: 42, color: new Color('#080085')},
      }),
    });

    it('completes drawings by dispatching DrawingActions.addDrawing and calling endDrawing for drawingMode = "add"', () => {
      const labelText = 'labelText';
      const mode: DrawingMode = 'add';
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(
        graphicMock,
        labelText,
        2056,
        UserDrawingLayer.Drawings,
      );

      const expectedAction = DrawingActions.addDrawing({drawing: internalDrawingRepresentation});

      service.completeTextDrawing(graphicMock, mode, labelText);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes drawings by dispatching DrawingActions.addDrawing and calling endDrawing for drawingMode = "edit"', () => {
      const labelText = 'labelText';
      const mode: DrawingMode = 'edit';
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(
        graphicMock,
        labelText,
        2056,
        UserDrawingLayer.Drawings,
      );

      const expectedAction = DrawingActions.addDrawing({drawing: internalDrawingRepresentation});

      service.completeTextDrawing(graphicMock, mode, labelText);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes drawings by dispatching DrawingActions.deleteDrawing and calling endDrawing', () => {
      const labelText = 'labelText';
      const mode: DrawingMode = 'delete';
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const drawingId = graphicMock.attributes[MapConstants.DRAWING_IDENTIFIER];

      const expectedAction = DrawingActions.deleteDrawing({drawingId});

      service.completeTextDrawing(graphicMock, mode, labelText);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes measurements by dispatching DrawingActions.addDrawings and calling endDrawing for drawingMode = "add"', () => {
      const mode: DrawingMode = 'add';
      const labelText = 'labelText';
      const labelPoint = new Graphic({
        attributes: {
          [MapConstants.DRAWING_IDENTIFIER]: 'idTwo',
          [MapConstants.DRAWING_LABEL_IDENTIFIER]: 'id',
        },
        geometry: new Polygon({
          spatialReference: {wkid: 4326},
          rings: [
            [
              [0, 0],
              [0, 69],
              [42, 0],
              [0, 0],
            ],
          ],
        }),
        symbol: new SimpleFillSymbol({
          color: new Color(Color.fromHex('#abcdef')!),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        2056,
        UserDrawingLayer.Measurements,
      );
      const internalDrawingRepresentationLabel = EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(
        labelPoint,
        labelText,
        2056,
        UserDrawingLayer.Measurements,
      );

      const expectedAction = DrawingActions.addDrawings({drawings: [internalDrawingRepresentation, internalDrawingRepresentationLabel]});

      service.completeMeasurement(graphicMock, labelPoint, labelText, mode);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes measurements by dispatching DrawingActions.addDrawings and calling endDrawing for drawingMode = "edit"', () => {
      const mode: DrawingMode = 'edit';
      const labelText = 'labelText';
      const labelPoint = new Graphic({
        attributes: {
          [MapConstants.DRAWING_IDENTIFIER]: 'idTwo',
          [MapConstants.DRAWING_LABEL_IDENTIFIER]: 'id',
        },
        geometry: new Polygon({
          spatialReference: {wkid: 4326},
          rings: [
            [
              [0, 0],
              [0, 69],
              [42, 0],
              [0, 0],
            ],
          ],
        }),
        symbol: new SimpleFillSymbol({
          color: new Color(Color.fromHex('#abcdef')!),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        2056,
        UserDrawingLayer.Measurements,
      );
      const internalDrawingRepresentationLabel = EsriGraphicToInternalDrawingRepresentationUtils.convertLabelText(
        labelPoint,
        labelText,
        2056,
        UserDrawingLayer.Measurements,
      );

      const expectedAction = DrawingActions.addDrawings({drawings: [internalDrawingRepresentation, internalDrawingRepresentationLabel]});

      service.completeMeasurement(graphicMock, labelPoint, labelText, mode);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes measurements by dispatching DrawingActions.deleteDrawing and calling endDrawing for drawingMode = "delete"', () => {
      const mode: DrawingMode = 'delete';
      const labelText = 'labelText';
      const labelPoint = new Graphic({
        attributes: {
          [MapConstants.DRAWING_IDENTIFIER]: 'idTwo',
          [MapConstants.DRAWING_LABEL_IDENTIFIER]: 'id',
        },
        geometry: new Polygon({
          spatialReference: {wkid: 4326},
          rings: [
            [
              [0, 0],
              [0, 69],
              [42, 0],
              [0, 0],
            ],
          ],
        }),
        symbol: new SimpleFillSymbol({
          color: new Color(Color.fromHex('#abcdef')!),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const drawingId = graphicMock.attributes[MapConstants.DRAWING_IDENTIFIER];

      const expectedAction = DrawingActions.deleteDrawing({drawingId});

      service.completeMeasurement(graphicMock, labelPoint, labelText, mode);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes selections by dispatching DataDownloadOrderActions.setSelection if the selection is not `undefined`', () => {
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        2056,
        InternalDrawingLayer.Selection,
      );
      const selection: DataDownloadSelection = {
        type: 'polygon',
        drawingRepresentation: internalDrawingRepresentation,
      };
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const removeHandlesSpy = spyOn(mapViewService.mapView, 'removeHandles').and.stub();

      const expectedAction = DataDownloadOrderActions.setSelection({selection});

      service.completeSelection(selection);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(removeHandlesSpy).toHaveBeenCalledOnceWith('EsriToolService');
    });

    it('completes selections by dispatching ToolActions.cancelTool if the selection is `undefined`', () => {
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const removeHandlesSpy = spyOn(mapViewService.mapView, 'removeHandles').and.stub();

      const expectedAction = ToolActions.cancelTool();

      service.completeSelection(undefined);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(removeHandlesSpy).toHaveBeenCalledOnceWith('EsriToolService');
    });

    it('should cancel the tool strategy when being cancelled from outside', () => {
      const toolStrategySpy = spyOn(EsriDefaultStrategy.prototype, 'cancel').and.stub();

      service.cancelTool();

      expect(toolStrategySpy).toHaveBeenCalled();
    });

    it('should convert and dispatch an internal drawing representation on completion for add from outside', () => {
      const mockInternalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
        source: UserDrawingLayer.Drawings,
        geometry: {coordinates: {}, srs: 2056} as PointWithSrs,
        type: 'Feature',
        properties: {
          style: {} as Gb3StyleRepresentation,
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
      };

      const graphic = new Graphic();

      const convertSpy = spyOn(EsriGraphicToInternalDrawingRepresentationUtils, 'convert').and.returnValue(
        mockInternalDrawingRepresentation,
      );
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();

      service.completeDrawing(graphic, 'add');

      expect(convertSpy).toHaveBeenCalledWith(graphic, 2056, UserDrawingLayer.Drawings);
      expect(storeSpy).toHaveBeenCalledWith(DrawingActions.addDrawing({drawing: mockInternalDrawingRepresentation}));
      expect(endDrawingSpy).toHaveBeenCalled();
    });

    it('should convert and dispatch an internal drawing representation on completion for edit from outside', () => {
      const mockInternalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
        source: UserDrawingLayer.Drawings,
        geometry: {coordinates: {}, srs: 2056} as PointWithSrs,
        type: 'Feature',
        properties: {
          style: {} as Gb3StyleRepresentation,
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
      };

      const graphic = new Graphic();

      const convertSpy = spyOn(EsriGraphicToInternalDrawingRepresentationUtils, 'convert').and.returnValue(
        mockInternalDrawingRepresentation,
      );
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();

      service.completeDrawing(graphic, 'edit');

      expect(convertSpy).toHaveBeenCalledWith(graphic, 2056, UserDrawingLayer.Drawings);
      expect(storeSpy).toHaveBeenCalledWith(DrawingActions.addDrawing({drawing: mockInternalDrawingRepresentation}));
      expect(endDrawingSpy).toHaveBeenCalled();
    });

    it('should dispatch a delete drawing action when deleting from outside', () => {
      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      const mockDrawingId = 'yes';
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue(mockDrawingId);
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();

      service.completeDrawing(graphic, 'delete');

      expect(storeSpy).toHaveBeenCalledWith(DrawingActions.deleteDrawing({drawingId: mockDrawingId}));
      expect(endDrawingSpy).toHaveBeenCalled();
    });

    it('should convert and dispatch an internal representation of a map drawing symbol for add from outside', () => {
      const mockInternalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
        source: UserDrawingLayer.Drawings,
        geometry: {coordinates: {}, srs: 2056} as PointWithSrs,
        type: 'Feature',
        properties: {
          style: {} as Gb3StyleRepresentation,
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
      };

      const mockSize = 10;
      const mockRotation = 11;
      const mockMapDrawingSymbol: EsriMapDrawingSymbol = {
        drawingSymbolDefinition: new EsriDrawingSymbolDefinition(),
      };
      const graphic = new Graphic();

      const convertSpy = spyOn(EsriGraphicToInternalDrawingRepresentationUtils, 'convertMapDrawingSymbol').and.returnValue(
        mockInternalDrawingRepresentation,
      );
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.callThrough();

      const mapViewGoToSpy = spyOn(mapViewService.mapView, 'goTo').and.stub();
      service.completeMapSymbolDrawing(graphic, 'edit', mockMapDrawingSymbol, mockSize, mockRotation);

      expect(convertSpy).toHaveBeenCalledWith(graphic, mockMapDrawingSymbol, mockSize, mockRotation, 2056, UserDrawingLayer.Drawings);
      expect(storeSpy).toHaveBeenCalledWith(DrawingActions.addDrawing({drawing: mockInternalDrawingRepresentation}));
      expect(endDrawingSpy).toHaveBeenCalled();
      expect(mapViewGoToSpy).toHaveBeenCalled();
    });

    it('should convert and dispatch an internal representation of a map drawing symbol for ediit from outside', () => {
      const mockInternalDrawingRepresentation: Gb3StyledInternalDrawingRepresentation = {
        source: UserDrawingLayer.Drawings,
        geometry: {coordinates: {}, srs: 2056} as PointWithSrs,
        type: 'Feature',
        properties: {
          style: {} as Gb3StyleRepresentation,
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
      };

      const mockSize = 10;
      const mockRotation = 11;
      const mockMapDrawingSymbol: EsriMapDrawingSymbol = {
        drawingSymbolDefinition: new EsriDrawingSymbolDefinition(),
      };
      const graphic = new Graphic();

      const convertSpy = spyOn(EsriGraphicToInternalDrawingRepresentationUtils, 'convertMapDrawingSymbol').and.returnValue(
        mockInternalDrawingRepresentation,
      );
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.callThrough();

      const mapViewGoToSpy = spyOn(mapViewService.mapView, 'goTo').and.stub();

      service.completeMapSymbolDrawing(graphic, 'add', mockMapDrawingSymbol, mockSize, mockRotation);

      expect(convertSpy).toHaveBeenCalledWith(graphic, mockMapDrawingSymbol, mockSize, mockRotation, 2056, UserDrawingLayer.Drawings);
      expect(storeSpy).toHaveBeenCalledWith(DrawingActions.addDrawing({drawing: mockInternalDrawingRepresentation}));
      expect(endDrawingSpy).toHaveBeenCalled();
      expect(mapViewGoToSpy).toHaveBeenCalled();
    });

    it('should dispatch a delete drawing action when deleting a symbol from outside', () => {
      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      const mockDrawingId = 'yes';
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue(mockDrawingId);
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.callThrough();

      service.completeMapSymbolDrawing(graphic, 'delete', {}, 10, 11);

      expect(storeSpy).toHaveBeenCalledWith(DrawingActions.deleteDrawing({drawingId: mockDrawingId}));
      expect(endDrawingSpy).toHaveBeenCalled();
    });
  });

  describe('Edit Drawing', () => {
    let graphicMock: Graphic;
    beforeEach(() => {
      graphicMock = new Graphic({
        attributes: {
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
        layer: {
          id: 'USER_DRAWING__drawings',
        } as Layer,
        geometry: new Polygon({
          spatialReference: {wkid: 2056},
          rings: [
            [
              [0, 0],
              [0, 69],
              [42, 0],
              [0, 0],
            ],
          ],
        }),
        symbol: new SimpleFillSymbol({
          color: new Color(Color.fromHex('#abcdef')!),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
    });

    it('should call the correct edit method on the strategy and dispatch the correct action', () => {
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const editSpy = spyOn(EsriPointDrawingStrategy.prototype, 'edit').and.stub();
      service.editDrawing(graphicMock);
      const expectedAction = DrawingActions.selectDrawing({drawingId: graphicMock.attributes[MapConstants.DRAWING_IDENTIFIER]});

      expect(editSpy).toHaveBeenCalledOnceWith(graphicMock);
      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
    });
    it('should throw an error when the graphic has a nullish layer', () => {
      // We exeplicitly do not set anything here.
      const graphic = new Graphic();

      expect(() => service.editDrawing(graphic)).toThrow(new EditFeatureInitializationFailed('Zeichnung ist keinem Layer zugewiesen.'));
    });
    it('should call the correct edit method on the strategy and not dispatch an action for measurements', () => {
      (graphicMock.layer!.id as any) = 'USER_DRAWING__measurements';
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const editSpy = spyOn(EsriPointMeasurementStrategy.prototype, 'edit').and.stub();
      service.editDrawing(graphicMock);

      expect(editSpy).toHaveBeenCalledOnceWith(graphicMock);
      expect(storeSpy).not.toHaveBeenCalled();
    });
    it('should do nothing if the graphic has no id', () => {
      graphicMock.attributes[MapConstants.DRAWING_IDENTIFIER] = undefined;
      service.editDrawing(graphicMock);
      const setToolStrategySpy = spyOn<any>(service, 'setToolStrategyForEditingFeature').and.stub();
      expect(setToolStrategySpy).not.toHaveBeenCalled();
    });
  });

  describe('Import', () => {
    it('should add many existing graphics to a given drawing layer', fakeAsync(() => {
      const mockDrawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [
        {
          properties: {
            style: {} as Gb3StyleRepresentation,
            [MapConstants.DRAWING_IDENTIFIER]: 'id',
            [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
          source: UserDrawingLayer.Drawings,
        } as Gb3StyledInternalDrawingRepresentation,
        {
          properties: {
            style: {} as Gb3StyleRepresentation,
            [MapConstants.DRAWING_IDENTIFIER]: 'id',
            [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
          source: UserDrawingLayer.Drawings,
        } as Gb3StyledInternalDrawingRepresentation,
      ];
      const mockFullLayerIdentifier = 'yes';
      const mockGraphicsLayer = new GraphicsLayer();

      spyOn(DrawingActiveMapItem, 'getFullLayerIdentifier').and.returnValue(mockFullLayerIdentifier);
      spyOn(mapViewService, 'findEsriLayer').and.returnValue(mockGraphicsLayer);
      spyOn(InternalDrawingRepresentationToEsriGraphicUtils, 'convert').and.resolveTo(new Graphic());
      const addManySpy = spyOn(mockGraphicsLayer, 'addMany').and.stub();

      service.addExistingDrawingsToLayer(mockDrawingsToAdd, UserDrawingLayer.Drawings);

      flushMicrotasks();

      expect(addManySpy).toHaveBeenCalled();
    }));

    it('should throw an appropriate error if the drawing layer is not initialized yet', fakeAsync(() => {
      const mockDrawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [
        {
          properties: {
            style: {} as Gb3StyleRepresentation,
            [MapConstants.DRAWING_IDENTIFIER]: 'id',
            [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
          source: UserDrawingLayer.Drawings,
        } as Gb3StyledInternalDrawingRepresentation,
        {
          properties: {
            style: {} as Gb3StyleRepresentation,
            [MapConstants.DRAWING_IDENTIFIER]: 'id',
            [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
            [MapConstants.TOOL_IDENTIFIER]: 'point',
          },
          source: UserDrawingLayer.Drawings,
        } as Gb3StyledInternalDrawingRepresentation,
      ];
      const mockFullLayerIdentifier = 'yes';

      spyOn(DrawingActiveMapItem, 'getFullLayerIdentifier').and.returnValue(mockFullLayerIdentifier);
      spyOn(mapViewService, 'findEsriLayer').and.returnValue(undefined);

      expectAsync(service.addExistingDrawingsToLayer(mockDrawingsToAdd, UserDrawingLayer.Drawings)).toBeRejectedWithError(
        DrawingLayerNotInitialized,
      );
    }));
  });

  describe('Update Drawing Style', () => {
    let graphicMock: Graphic;
    let drawingMock: Gb3StyledInternalDrawingRepresentation;

    beforeEach(() => {
      graphicMock = new Graphic({
        attributes: {
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
        layer: {
          id: 'USER_DRAWING__drawings',
        } as Layer,
        geometry: new Polygon({
          spatialReference: {wkid: 2056},
          rings: [
            [
              [0, 0],
              [0, 69],
              [42, 0],
              [0, 0],
            ],
          ],
        }),
        symbol: new SimpleFillSymbol({
          color: new Color(Color.fromHex('#abcdef')!),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      drawingMock = {
        properties: {
          style: {} as Gb3StyleRepresentation,
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.BELONGS_TO_IDENTIFIER]: 'belongsTo_id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
        source: UserDrawingLayer.Drawings,
      } as Gb3StyledInternalDrawingRepresentation;
    });
    it('should call the convert method on if the drawingLayer is found', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();
      const userDrawingLayerId = DrawingLayerPrefix.Drawing + UserDrawingLayer.Drawings;
      // add the graphic layer to the view to avoid the initialization
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: userDrawingLayerId,
          graphics: [graphicMock],
        }),
      );
      const style = {} as Gb3StyleRepresentation;
      const labelText = 'some Text';
      service.updateDrawingStyles(drawingMock, style, labelText);
      expect(convertSpy).toHaveBeenCalledOnceWith(style, labelText, undefined);
    });
    it('should update the internals of the given tool strategy when it is an abstract esri drawing strategy', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();
      const userDrawingLayerId = DrawingLayerPrefix.Drawing + UserDrawingLayer.Drawings;
      // add the graphic layer to the view to avoid the initialization
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: userDrawingLayerId,
          graphics: [graphicMock],
        }),
      );
      const style = {} as Gb3StyleRepresentation;
      const labelText = 'some Text';
      spyOn(EsriTextDrawingStrategy.prototype, 'edit').and.stub();
      const updateInternalsSpy = spyOn(EsriTextDrawingStrategy.prototype, 'updateInternals').and.stub();
      const layer = new Layer();
      layer.id = 'yes_drawings_please';

      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue('yes');
      getAttributeSpy.withArgs('__tool').and.returnValue('point');
      spyOnProperty(graphic, 'symbol').and.returnValue(new TextSymbol());
      spyOnProperty(graphic, 'layer').and.returnValue(layer);
      spyOnProperty(graphic, 'geometry').and.returnValue(new Point());

      service.editDrawing(graphic);

      service.updateDrawingStyles(drawingMock, style, labelText);
      expect(convertSpy).toHaveBeenCalledOnceWith(style, labelText, undefined);
      expect(updateInternalsSpy).toHaveBeenCalledWith(style, labelText, undefined);
    });
    it('should not call the convert method if the drawing layer does not contain a graphic', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();
      const userDrawingLayerId = DrawingLayerPrefix.Drawing + UserDrawingLayer.Drawings;
      // add the graphic layer to the view to avoid the initialization
      mapViewService.mapView.map.layers.add(
        new GraphicsLayer({
          id: userDrawingLayerId,
          graphics: [],
        }),
      );
      const style = {} as Gb3StyleRepresentation;
      const labelText = 'some Text';
      service.updateDrawingStyles(drawingMock, style, labelText);
      expect(convertSpy).not.toHaveBeenCalled();
    });
    it('should throw an error if the given graphic has no geometry', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();
      const layer = new Layer();
      layer.id = 'yes_drawings_please';

      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue('yes');
      getAttributeSpy.withArgs('__tool').and.returnValue('point');
      spyOnProperty(graphic, 'symbol').and.returnValue(new TextSymbol());
      spyOnProperty(graphic, 'layer').and.returnValue(layer);

      expect(() => service.editDrawing(graphic)).toThrow(new EditFeatureInitializationFailed('Keine Geometrie zum Bearbeiten'));

      expect(convertSpy).not.toHaveBeenCalledOnceWith();
    });
    it('should throw an error if the given graphic has no layer', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();
      const layer = new Layer();
      layer.id = 'yes_drawings_please';

      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue('yes');
      getAttributeSpy.withArgs('__tool').and.returnValue('point');
      spyOnProperty(graphic, 'symbol').and.returnValue(new TextSymbol());
      spyOnProperty(graphic, 'geometry').and.returnValue(new Point());
      spyOnProperty(graphic, 'layer').and.returnValue(null);

      expect(() => service.editDrawing(graphic)).toThrow(new EditFeatureInitializationFailed('Zeichnung ist keinem Layer zugewiesen.'));

      expect(convertSpy).not.toHaveBeenCalledOnceWith();
    });
    it('should select the correct drawing tool for circles', () => {
      const polygonStratEditSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'edit').and.stub();
      const layer = new Layer();
      layer.id = 'yes_drawings_please';

      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue('yes');
      getAttributeSpy.withArgs('__tool').and.returnValue('circle');
      spyOnProperty(graphic, 'symbol').and.returnValue(new TextSymbol());
      spyOnProperty(graphic, 'layer').and.returnValue(layer);
      spyOnProperty(graphic, 'geometry').and.returnValue(new Point());

      service.editDrawing(graphic);

      expect(polygonStratEditSpy).toHaveBeenCalled();
      expect(service['toolStrategy']).toBeInstanceOf(EsriPolygonDrawingStrategy);
    });
    it('should select the correct drawing tool for rectangles', () => {
      const polygonStratEditSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'edit').and.stub();
      const layer = new Layer();
      layer.id = 'yes_drawings_please';

      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue('yes');
      getAttributeSpy.withArgs('__tool').and.returnValue('rectangle');
      spyOnProperty(graphic, 'symbol').and.returnValue(new TextSymbol());
      spyOnProperty(graphic, 'layer').and.returnValue(layer);
      spyOnProperty(graphic, 'geometry').and.returnValue(new Point());

      service.editDrawing(graphic);

      expect(polygonStratEditSpy).toHaveBeenCalled();
      expect(service['toolStrategy']).toBeInstanceOf(EsriPolygonDrawingStrategy);
    });
    it('should select the correct drawing tool for symbols', () => {
      const polygonStratEditSpy = spyOn(EsriSymbolDrawingStrategy.prototype, 'edit').and.stub();
      const layer = new Layer();
      layer.id = 'yes_drawings_please';

      const graphic = new Graphic();
      const getAttributeSpy = spyOn(graphic, 'getAttribute');
      getAttributeSpy.withArgs(AbstractEsriDrawableToolStrategy.identifierFieldName).and.returnValue('yes');
      getAttributeSpy.withArgs('__tool').and.returnValue('point');
      spyOnProperty(graphic, 'symbol').and.returnValue(new CIMSymbol());
      spyOnProperty(graphic, 'layer').and.returnValue(layer);
      spyOnProperty(graphic, 'geometry').and.returnValue(new Point());

      service.editDrawing(graphic);

      expect(polygonStratEditSpy).toHaveBeenCalled();
      expect(service['toolStrategy']).toBeInstanceOf(EsriSymbolDrawingStrategy);
    });
    it('should not call the convert method if the drawingLayer does not exist', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();

      const style = {} as Gb3StyleRepresentation;
      const labelText = 'some Text';
      service.updateDrawingStyles(drawingMock, style, labelText);
      expect(convertSpy).not.toHaveBeenCalled();
    });
  });

  describe('Set Tool Strategy For Editing Feature', () => {
    let mockGraphic: Graphic;
    beforeEach(() => {
      mockGraphic = new Graphic({
        attributes: {
          [MapConstants.DRAWING_IDENTIFIER]: 'id',
          [MapConstants.TOOL_IDENTIFIER]: 'point',
        },
        layer: {
          id: 'USER_DRAWING__drawings',
        } as Layer,
        geometry: new Polygon({
          spatialReference: {wkid: 2056},
          rings: [
            [
              [0, 0],
              [0, 69],
              [42, 0],
              [0, 0],
            ],
          ],
        }),
        symbol: new SimpleFillSymbol({
          color: new Color(Color.fromHex('#abcdef')!),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
    });
    it('should set the correct strategy for a point drawing', () => {
      const setDrawingStrategySpy = spyOn<any>(service, 'setDrawingStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setDrawingStrategySpy).toHaveBeenCalledWith('draw-point', mockGraphic.layer);
    });
    it('should set the correct strategy for a polygon drawing', () => {
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polygon';
      const setDrawingStrategySpy = spyOn<any>(service, 'setDrawingStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setDrawingStrategySpy).toHaveBeenCalledWith('draw-polygon', mockGraphic.layer);
    });
    it('should set the correct strategy for a polyline drawing', () => {
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polyline';
      const setDrawingStrategySpy = spyOn<any>(service, 'setDrawingStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setDrawingStrategySpy).toHaveBeenCalledWith('draw-line', mockGraphic.layer);
    });

    it('should set the correct strategy for a point measurement', () => {
      (mockGraphic.layer!.id as any) = 'USER_DRAWING__measurements';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-point', mockGraphic.layer);
    });
    it('should set the correct strategy for a polygon measurement', () => {
      (mockGraphic.layer!.id as any) = 'USER_DRAWING__measurements';
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polygon';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-area', mockGraphic.layer);
    });
    it('should set the correct strategy for a polyline measurement', () => {
      (mockGraphic.layer!.id as any) = 'USER_DRAWING__measurements';
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polyline';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-line', mockGraphic.layer);
    });
    it('should set the correct strategy for a elevation profile', () => {
      (mockGraphic.layer!.id as any) = 'INTERNAL_DRAWING__elevation_profile';
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polyline';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-elevation-profile', mockGraphic.layer);
    });
    it('should throw an error for nonEditableLayers', () => {
      (mockGraphic.layer!.id as any) = 'INTERNAL_DRAWING__selection';
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polygon';

      expect(() => service['setToolStrategyForEditingFeature'](mockGraphic)).toThrow(new NonEditableLayerType());
    });
  });
});
