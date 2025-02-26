/* eslint-disable @typescript-eslint/dot-notation, @typescript-eslint/no-explicit-any */
import {TestBed} from '@angular/core/testing';
import {EsriToolService} from './esri-tool.service';
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
import {NonEditableLayerType} from '../errors/esri.errors';
import Layer from '@arcgis/core/layers/Layer';

describe('EsriToolService', () => {
  let service: EsriToolService;
  let mapMock: EsriMapMock;
  let mapViewService: EsriMapViewService = new EsriMapViewService();
  let store: MockStore;

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
    // mock the map view from Esri - otherwise any change to the layer list will create an error because the service call fails
    mapMock = new EsriMapMock([]);
    mapViewService = TestBed.inject(EsriMapViewService);
    mapViewService.mapView = {
      map: mapMock,
      addHandles<T>(handles: IHandle | IHandle[], groupKey?: GroupKey<T>) {},
      removeHandles<T>(groupKey?: GroupKey<T>) {},
      on(type: string | string[], listener: __esri.EventHandler): IHandle {
        return {} as IHandle;
      },
    } as __esri.MapView;
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
      it(`sets the correct strategy for point measurement`, () => {
        const pointSpy = spyOn(EsriPointMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-point');
        expect(pointSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for line measurement`, () => {
        const lineSpy = spyOn(EsriLineMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-line');
        expect(lineSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for area measurement`, () => {
        const polygonSpy = spyOn(EsriAreaMeasurementStrategy.prototype, 'start');
        service.initializeMeasurement('measure-area');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for circle measurement`, () => {
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
      it(`sets the correct strategy for point drawing`, () => {
        const pointSpy = spyOn(EsriPointDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-point');
        expect(pointSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for line drawing`, () => {
        const lineSpy = spyOn(EsriLineDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-line');
        expect(lineSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for polygon drawing`, () => {
        const polygonSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-polygon');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for text drawing`, () => {
        const polygonSpy = spyOn(EsriTextDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-text');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for rectangle drawing`, () => {
        const polygonSpy = spyOn(EsriPolygonDrawingStrategy.prototype, 'start');
        service.initializeDrawing('draw-rectangle');
        expect(polygonSpy).toHaveBeenCalled();
      });
      it(`sets the correct strategy for circle drawing`, () => {
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
        color: new Color(Color.fromHex('#abcdef')),
        outline: {width: 42, color: new Color('#080085')},
      }),
    });

    it('completes drawings by dispatching DrawingActions.addDrawing and calling endDrawing for drawingMOde = "add"', () => {
      const labelText = 'labelText';
      const mode: DrawingMode = 'add';
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        labelText,
        2056,
        UserDrawingLayer.Drawings,
      );

      const expectedAction = DrawingActions.addDrawing({drawing: internalDrawingRepresentation});

      service.completeDrawing(graphicMock, mode, labelText);

      expect(storeSpy).toHaveBeenCalledOnceWith(expectedAction);
      expect(endDrawingSpy).toHaveBeenCalledOnceWith();
    });

    it('completes drawings by dispatching DrawingActions.addDrawing and calling endDrawing for drawingMode = "edit"', () => {
      const labelText = 'labelText';
      const mode: DrawingMode = 'edit';
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        labelText,
        2056,
        UserDrawingLayer.Drawings,
      );

      const expectedAction = DrawingActions.addDrawing({drawing: internalDrawingRepresentation});

      service.completeDrawing(graphicMock, mode, labelText);

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

      service.completeDrawing(graphicMock, mode, labelText);

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
          color: new Color(Color.fromHex('#abcdef')),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        undefined,
        2056,
        UserDrawingLayer.Measurements,
      );
      const internalDrawingRepresentationLabel = EsriGraphicToInternalDrawingRepresentationUtils.convert(
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
          color: new Color(Color.fromHex('#abcdef')),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      const storeSpy = spyOn(store, 'dispatch').and.callThrough();
      const endDrawingSpy = spyOn<any>(service, 'endDrawing').and.stub();
      const internalDrawingRepresentation = EsriGraphicToInternalDrawingRepresentationUtils.convert(
        graphicMock,
        undefined,
        2056,
        UserDrawingLayer.Measurements,
      );
      const internalDrawingRepresentationLabel = EsriGraphicToInternalDrawingRepresentationUtils.convert(
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
          color: new Color(Color.fromHex('#abcdef')),
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
        undefined,
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
          color: new Color(Color.fromHex('#abcdef')),
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
    it('should call the correct edit method on the strategy and not dispatch an action for measurements', () => {
      graphicMock.layer!.set({id: 'USER_DRAWING__measurements'});
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
  describe('Update Drawing Style', () => {
    let graphicMock: Graphic;
    let drawingMOck: Gb3StyledInternalDrawingRepresentation;

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
          color: new Color(Color.fromHex('#abcdef')),
          outline: {width: 42, color: new Color('#080085')},
        }),
      });
      drawingMOck = {
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
      service.updateDrawingStyles(drawingMOck, style, labelText);
      expect(convertSpy).toHaveBeenCalledOnceWith(style, labelText);
    });

    it('should not call the convert method if the drawingLayer does not exist', () => {
      const convertSpy = spyOn(StyleRepresentationToEsriSymbolUtils, 'convert').and.stub();

      const style = {} as Gb3StyleRepresentation;
      const labelText = 'some Text';
      service.updateDrawingStyles(drawingMOck, style, labelText);
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
          color: new Color(Color.fromHex('#abcdef')),
          outline: {width: 42, color: new Color('#080085')},
        }),
      }) as unknown as Graphic;
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
      mockGraphic.layer!.set({id: 'USER_DRAWING__measurements'});
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-point', mockGraphic.layer);
    });
    it('should set the correct strategy for a polygon measurement', () => {
      mockGraphic.layer!.set({id: 'USER_DRAWING__measurements'});
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polygon';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-area', mockGraphic.layer);
    });
    it('should set the correct strategy for a polyline measurement', () => {
      mockGraphic.layer!.set({id: 'USER_DRAWING__measurements'});
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polyline';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-line', mockGraphic.layer);
    });
    it('should set the correct strategy for a elevation profile', () => {
      mockGraphic.layer!.set({id: 'INTERNAL_DRAWING__elevation_profile'});
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polyline';
      const setMeasurementStrategySpy = spyOn<any>(service, 'setMeasurementStrategy').and.stub();
      service['setToolStrategyForEditingFeature'](mockGraphic);
      expect(setMeasurementStrategySpy).toHaveBeenCalledWith('measure-elevation-profile', mockGraphic.layer);
    });
    it('should throw an error for nonEditableLayers', () => {
      mockGraphic.layer!.set({id: 'INTERNAL_DRAWING__selection'});
      mockGraphic.attributes[MapConstants.TOOL_IDENTIFIER] = 'polygon';

      expect(() => service['setToolStrategyForEditingFeature'](mockGraphic)).toThrow(new NonEditableLayerType());
    });
  });
});
