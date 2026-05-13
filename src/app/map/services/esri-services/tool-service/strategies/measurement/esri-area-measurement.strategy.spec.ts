/* eslint-disable @typescript-eslint/no-explicit-any */
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import {EsriAreaMeasurementStrategy} from './esri-area-measurement.strategy';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import {AbstractEsriMeasurementStrategy} from '../abstract-esri-measurement.strategy';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

class EsriAreaMeasurementStrategyWrapper extends EsriAreaMeasurementStrategy {
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
describe('EsriAreaMeasurementStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
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
    fillSymbol = new SimpleFillSymbol();
    textSymbol = new TextSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel and does not add the label', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );

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
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const removeLabelOnEditSpy = vi.spyOn(AbstractEsriMeasurementStrategy.prototype as any, 'removeLabelOnEdit');
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
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
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
        expect(layer.graphics.length).toEqual(1);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('creates the label at the centroid of the polygon', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [12, 0],
            [0, 12],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      vi.spyOn(console, 'error').mockImplementation(vi.fn());

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0);
        const expectedLocation = location.centroid!;
        expect(addedGraphic?.geometry?.type).toEqual('point');
        expect((addedGraphic?.geometry as Point).x).toEqual(expectedLocation.x);
        expect((addedGraphic?.geometry as Point).y).toEqual(expectedLocation.y);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('applies the defined styling to the created label', () => {
      textSymbol = new TextSymbol({haloColor: 'red', xoffset: 42, color: 'blue'});
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
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

        strategy.svm.complete();

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0);
        expect((addedGraphic?.symbol as TextSymbol).haloColor).toEqual(textSymbol.haloColor);
        expect((addedGraphic?.symbol as TextSymbol).xoffset).toEqual(textSymbol.xoffset);
        expect((addedGraphic?.symbol as TextSymbol).color).toEqual(textSymbol.color);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const completeEditingSpy = vi.spyOn(AbstractEsriMeasurementStrategy.prototype as any, 'completeEditing');
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

        callback({state: 'complete', graphic: graphic});

        expect(completeEditingSpy).toHaveBeenCalledWith(graphic);

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('label', () => {
    it('adds the area of the polygon as label', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const sideLength = 12;
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, sideLength],
            [sideLength, sideLength],
            [sideLength, 0],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        strategy.svm.complete();

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0);
        const expectedArea = Math.pow(sideLength, 2);
        expect((addedGraphic?.symbol as TextSymbol).text).toEqual(`${expectedArea} m²`);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('rounds the area to 2 decimals', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const sideLength = 42.1337;
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, sideLength],
            [sideLength, sideLength],
            [sideLength, 0],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        strategy.svm.complete();

        callback({state: 'complete', graphic: graphic});

        const expected = (sideLength * sideLength).toFixed(2);
        const addedGraphic = layer.graphics.getItemAt(0);
        expect((addedGraphic?.symbol as TextSymbol).text).toEqual(`${expected} m²`);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('rounds the area to km² after 100000 square metres', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const sideLength = 10000;
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, sideLength],
            [sideLength, sideLength],
            [sideLength, 0],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        strategy.svm.complete();

        callback({state: 'complete', graphic: graphic});

        const addedGraphic = layer.graphics.getItemAt(0);
        const expextedLength = Math.round((sideLength * sideLength) / 1000000);
        expect((addedGraphic?.symbol as TextSymbol).text).toEqual(`${expextedLength} km²`);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('mode', () => {
    it('sets mode to click', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('polygon', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        textSymbol,
        () => callbackHandler.handle(),
        'polygon',
      );
      const spy = vi.spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
