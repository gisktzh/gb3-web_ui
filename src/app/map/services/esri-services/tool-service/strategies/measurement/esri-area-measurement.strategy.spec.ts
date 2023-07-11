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

class EsriAreaMeasurementStrategyWrapper extends EsriAreaMeasurementStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

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
    }
  };

  beforeEach(() => {
    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: UserDrawingLayer.Measurements
    });
    mapView.map.layers.add(layer);
    fillSymbol = new SimpleFillSymbol();
    textSymbol = new TextSymbol();
  });

  describe('cancellation', () => {
    it('fires the callback handler on cancel and does not add the label', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());

      strategy.start();
      strategy.svm.emit('create', {state: 'cancel', graphic: new Graphic()});

      expect(callbackSpy).toHaveBeenCalled();
      expect(layer.graphics.length).toEqual(0);
    });
  });

  describe('completion', () => {
    it('adds the label and fires the callback handler on completion', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());
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
      expect(layer.graphics.length).toEqual(1);
    });

    it('creates the label at the centroid of the polygon', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [12, 0],
            [0, 12]
          ]
        ]
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      const expectedLocation = location.centroid;
      expect(addedGraphic.geometry.type).toEqual('point');
      expect((addedGraphic.geometry as Point).x).toEqual(expectedLocation.x);
      expect((addedGraphic.geometry as Point).y).toEqual(expectedLocation.y);
    });

    it('applies the defined styling to the created label', () => {
      textSymbol = new TextSymbol({haloColor: 'red', xoffset: 42, color: 'blue'});
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());
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
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      expect((addedGraphic.symbol as TextSymbol).haloColor).toEqual(textSymbol.haloColor);
      expect((addedGraphic.symbol as TextSymbol).xoffset).toEqual(textSymbol.xoffset);
      expect((addedGraphic.symbol as TextSymbol).color).toEqual(textSymbol.color);
    });
  });

  describe('label', () => {
    it('adds the area of the polygon as label', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());
      const sideLength = 12;
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, sideLength],
            [sideLength, sideLength],
            [sideLength, 0]
          ]
        ]
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      const expectedArea = Math.pow(sideLength, 2);
      expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${expectedArea} m²`);
    });

    it('rounds the area to 2 decimals', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());
      const sideLength = 42.1337;
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, sideLength],
            [sideLength, sideLength],
            [sideLength, 0]
          ]
        ]
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const expected = (sideLength * sideLength).toFixed(2);
      const addedGraphic = layer.graphics.getItemAt(0);
      expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${expected} m²`);
    });

    it('rounds the area to km² after 100000 square metres', () => {
      const strategy = new EsriAreaMeasurementStrategyWrapper(layer, mapView, fillSymbol, textSymbol, () => callbackHandler.handle());
      const sideLength = 10_000;
      const location = new Polygon({
        spatialReference: {wkid: 2056},
        rings: [
          [
            [0, 0],
            [0, sideLength],
            [sideLength, sideLength],
            [sideLength, 0]
          ]
        ]
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      const expextedLength = Math.round((sideLength * sideLength) / 1_000_000);
      expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${expextedLength} km²`);
    });
  });
});
