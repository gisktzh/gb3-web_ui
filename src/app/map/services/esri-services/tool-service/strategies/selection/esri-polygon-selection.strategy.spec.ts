import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import {EsriPolygonSelectionStrategy} from './esri-polygon-selection.strategy';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {EsriGraphicToInternalDrawingRepresentationUtils} from '../../../utils/esri-graphic-to-internal-drawing-representation.utils';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

class EsriPolygonSelectionStrategyWrapper extends EsriPolygonSelectionStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

const mockResourceHandle = {
  remove: vi.fn(),
};

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is currently not triggered.
 * As such, we only test for the labels, which are also our custom logic and should be tested. This is why we e.g. assert for a length
 * of 0 on the graphics layer, even though in reality, it should be 2 (when Esri properly adds the graphic).
 */
describe('EsriPolygonSelectionStrategy', () => {
  const callbackHandler = {
    handle: (selection: DataDownloadSelection | undefined) => {
      return selection;
    },
  };

  let mapView: MapView;
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideMockStore({})],
    });
    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    mapView.map!.layers.add(layer);
    fillSymbol = new SimpleFillSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'polygon',
        2056,
      );

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'cancel', graphic: new Graphic()});

        expect(callbackSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('removes all existing layers on start', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const layerRemoveAllSpy = vi.spyOn(layer, 'removeAll');
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'polygon',
        2056,
      );

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'start'});

        expect(layerRemoveAllSpy).toHaveBeenCalledTimes(2);
        expect(callbackSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('fires the callback handler on completion', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const converterSpy = vi.spyOn(EsriGraphicToInternalDrawingRepresentationUtils, 'convert');
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'polygon',
        2056,
      );
      const graphic = new Graphic({
        symbol: fillSymbol,
        geometry: new Polygon({
          spatialReference: {wkid: 2056},
          rings: [
            [
              [0, 0],
              [12, 0],
              [0, 12],
            ],
          ],
        }),
      });

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic});

        expect(callbackSpy).toHaveBeenCalledWith(expect.objectContaining({type: 'polygon'}));
        expect(converterSpy).toHaveBeenCalledWith(graphic, 2056, InternalDrawingLayer.Selection);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('polygon type and mode', () => {
    it('sets polygon type to rectangle', () => {
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'rectangle',
        2056,
      );
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('rectangle', {mode: 'click'});
    });

    it('sets polygon type to circle', () => {
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'circle',
        2056,
      );
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('circle', {mode: 'click'});
    });

    it('sets polygon type to polygon', () => {
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'polygon',
        2056,
      );
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('polygon', {mode: 'click'});
    });
  });
});
