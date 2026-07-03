import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import {EsriPolygonDrawingStrategy} from './esri-polygon-drawing.strategy';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

class EsriPolygonDrawingStrategyWrapper extends EsriPolygonDrawingStrategy {
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
describe('EsriPolygonDrawingStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
  const callbackHandler = {
    handle: () => {
      return undefined;
    },
  };

  beforeEach(() => {
    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: UserDrawingLayer.Measurements,
    });
    mapView.map!.layers.add(layer);
    fillSymbol = new SimpleFillSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');

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

  describe('completion', () => {
    it('fires the callback handler on completion', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');
      const graphic = new Graphic({
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

        callback({state: 'complete', graphic: graphic});

        expect(callbackSpy).toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- spy on private method of prototype
      const completeEditingSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'completeEditing');
      const graphic = new Graphic({
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
        expect(eventName).toEqual('update');

        callback({state: 'complete'});

        expect(completeEditingSpy).toHaveBeenCalledWith(graphic);

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('polygon type and mode', () => {
    it('sets polygon type to rectangle', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'rectangle');
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('rectangle', {mode: 'click'});
    });

    it('sets polygon type to circle', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'circle');
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('circle', {mode: 'click'});
    });

    it('sets polygon type to polygon', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('polygon', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');
      const spy = vi.spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
