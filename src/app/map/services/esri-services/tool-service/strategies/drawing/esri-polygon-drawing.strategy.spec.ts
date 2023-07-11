import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import Polygon from '@arcgis/core/geometry/Polygon';
import {EsriPolygonDrawingStrategy} from './esri-polygon-drawing.strategy';

class EsriPolygonDrawingStrategyWrapper extends EsriPolygonDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

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
    }
  };

  beforeEach(() => {
    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: UserDrawingLayer.Measurements
    });
    mapView.map.layers.add(layer);
    fillSymbol = new SimpleFillSymbol();
  });

  describe('cancellation', () => {
    it('fires the callback handler on cancel', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');

      strategy.start();
      strategy.svm.emit('create', {state: 'cancel', graphic: new Graphic()});

      expect(callbackSpy).toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('fires the callback handler on completion', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');
      const graphic = new Graphic({
        geometry: new Polygon({
          spatialReference: {wkid: 2056},
          rings: [
            [
              [0, 0],
              [12, 0],
              [0, 12]
            ]
          ]
        })
      });

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      expect(callbackSpy).toHaveBeenCalled();
    });
  });

  describe('polygon type and mode', () => {
    it('sets polygon type to rectangle', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'rectangle');
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('rectangle', {mode: 'click'});
    });

    it('sets polygon type to circle', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'circle');
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('circle', {mode: 'click'});
    });

    it('sets polygon type to polygon', () => {
      const strategy = new EsriPolygonDrawingStrategyWrapper(layer, mapView, fillSymbol, () => callbackHandler.handle(), 'polygon');
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('polygon', {mode: 'click'});
    });
  });
});
