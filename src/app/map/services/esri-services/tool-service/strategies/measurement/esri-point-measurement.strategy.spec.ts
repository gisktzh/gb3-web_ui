/* eslint-disable @typescript-eslint/no-explicit-any */
import {EsriPointMeasurementStrategy} from './esri-point-measurement.strategy';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import {AbstractEsriMeasurementStrategy} from '../abstract-esri-measurement.strategy';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

class EsriPointMeasurementStrategyWrapper extends EsriPointMeasurementStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

const mockResourceHandle = {
  remove: vi.fn(),
};

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is
 * currently not triggered. As such, we only test for the labels, which are also our custom logic and should be tested.
 * This is why we e.g. assert for a length of 0 on the graphics layer, even though in reality, it should be 2 (when
 * Esri properly adds the graphic).
 */
describe('EsriPointMeasurementStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let pointSymbol: SimpleMarkerSymbol;
  let textSymbol: TextSymbol;
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
    textSymbol = new TextSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel and does not add the label', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'cancel', graphic: new Graphic()});

        expect(callbackSpy).not.toHaveBeenCalled();
        expect(layer.graphics.length).toEqual(0);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('activation', () => {
    it('calls removeLabelOnEdit on activating the edit mode', () => {
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const removeLabelOnEditSpy = vi.spyOn(AbstractEsriMeasurementStrategy.prototype as any, 'removeLabelOnEdit');
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('update');

        callback({state: 'start'});

        expect(removeLabelOnEditSpy).toHaveBeenCalledWith(graphic);

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('adds the label and fires the callback handler on completion', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic: graphic});

        expect(callbackSpy).toHaveBeenCalled();
        expect(layer.graphics.length).toEqual(1);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('creates the label at the correct location ', () => {
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const location = new Point({x: 1337, y: 42});
      const graphic = new Graphic({geometry: location});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0)!;
        expect(addedGraphic.geometry?.type).toEqual('point');
        expect((addedGraphic.geometry as Point).x).toEqual(location.x);
        expect((addedGraphic.geometry as Point).y).toEqual(location.y);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('applies the defined styling to the created graphic', () => {
      textSymbol = new TextSymbol({haloColor: 'red', xoffset: 42, color: 'blue'});

      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        strategy.svm.complete();

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0)!;
        expect((addedGraphic.symbol as TextSymbol).haloColor).toEqual(textSymbol.haloColor);
        expect((addedGraphic.symbol as TextSymbol).xoffset).toEqual(textSymbol.xoffset);
        expect((addedGraphic.symbol as TextSymbol).color).toEqual(textSymbol.color);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('adds the coordinate position as label', () => {
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const location = new Point({x: 1, y: 2});
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        strategy.svm.complete();

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0)!;
        expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${location.x}/${location.y}`);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const completeEditingSpy = vi.spyOn(AbstractEsriMeasurementStrategy.prototype as any, 'completeEditing');
      const graphic = new Graphic({geometry: new Point({x: 1, y: 2})});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('update');

        strategy.svm.complete();

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
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('point', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
      const spy = vi.spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
