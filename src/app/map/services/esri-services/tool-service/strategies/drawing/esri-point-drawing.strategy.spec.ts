import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import {EsriPointDrawingStrategy} from './esri-point-drawing.strategy';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

class EsriPointDrawingStrategyWrapper extends EsriPointDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

const mockResourceHandle = {
  remove: vi.fn(),
};

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is currently not triggered.
 * As such, we do not test for the addition of the graphics which should be handled by the Esri framework any way.
 */
describe('EsriPointDrawingStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let pointSymbol: SimpleMarkerSymbol;
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
    pointSymbol = new SimpleMarkerSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());

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
      const strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic});

        expect(callbackSpy).toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- spy on private method of prototype
      const completeEditingSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'completeEditing');
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

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

  describe('mode', () => {
    it('sets mode to click', () => {
      const strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('point', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
      const spy = vi.spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
