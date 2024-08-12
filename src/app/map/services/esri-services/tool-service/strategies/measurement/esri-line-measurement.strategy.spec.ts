import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import {EsriLineMeasurementStrategy} from './esri-line-measurement.strategy';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Polyline from '@arcgis/core/geometry/Polyline';
import {AbstractEsriMeasurementStrategy} from '../abstract-esri-measurement.strategy';

class EsriLineMeasurementStrategyWrapper extends EsriLineMeasurementStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is currently not triggered.
 * As such, we only test for the labels, which are also our custom logic and should be tested. This is why we e.g. assert for a length
 * of 0 on the graphics layer, even though in reality, it should be 2 (when Esri properly adds the graphic).
 */
describe('EsriLineMeasurementStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let lineSymbol: SimpleLineSymbol;
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
    mapView.map.layers.add(layer);
    lineSymbol = new SimpleLineSymbol();
    textSymbol = new TextSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel and does not add the label', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());

      strategy.start();
      strategy.svm.emit('create', {state: 'cancel', graphic: new Graphic()});

      expect(callbackSpy).not.toHaveBeenCalled();
      expect(layer.graphics.length).toEqual(0);
    });
  });

  describe('activation', () => {
    it('calls removeLabelOnEdit on activating the edit mode', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const removeLabelOnEditSpy = spyOn<any>(AbstractEsriMeasurementStrategy.prototype, 'removeLabelOnEdit');
      const graphic = new Graphic();

      strategy.edit(graphic);
      strategy.svm.emit('update', {state: 'start'});

      expect(removeLabelOnEditSpy).toHaveBeenCalledWith(graphic);
    });
  });

  describe('completion', () => {
    it('adds the label and fires the callback handler on completion', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const graphic = new Graphic({
        geometry: new Polyline({
          spatialReference: {wkid: 2056},
          paths: [
            [
              [0, 0],
              [12, 0],
            ],
          ],
        }),
      });

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      expect(callbackSpy).toHaveBeenCalled();
      expect(layer.graphics.length).toEqual(1);
    });

    it('creates the label at the last point of the line geometry', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const location = new Polyline({
        spatialReference: {wkid: 2056},
        paths: [
          [
            [0, 0],
            [12, 0],
            [555, 64],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      const numberOfVertices = location.paths[0].length;
      expect(addedGraphic.geometry.type).toEqual('point');
      expect((addedGraphic.geometry as Point).x).toEqual(location.getPoint(0, numberOfVertices - 1).x);
      expect((addedGraphic.geometry as Point).y).toEqual(location.getPoint(0, numberOfVertices - 1).y);
    });

    it('applies the defined styling to the created label', () => {
      textSymbol = new TextSymbol({haloColor: 'red', xoffset: 42, color: 'blue'});
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const graphic = new Graphic({
        geometry: new Polyline({
          spatialReference: {wkid: 2056},
          paths: [
            [
              [0, 0],
              [12, 0],
            ],
          ],
        }),
      });

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      expect((addedGraphic.symbol as TextSymbol).haloColor).toEqual(textSymbol.haloColor);
      expect((addedGraphic.symbol as TextSymbol).xoffset).toEqual(textSymbol.xoffset);
      expect((addedGraphic.symbol as TextSymbol).color).toEqual(textSymbol.color);
    });
    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const completeEditingSpy = spyOn<any>(AbstractEsriMeasurementStrategy.prototype, 'completeEditing');
      const graphic = new Graphic({
        geometry: new Polyline({
          spatialReference: {wkid: 2056},
          paths: [
            [
              [0, 0],
              [12, 0],
            ],
          ],
        }),
      });

      strategy.edit(graphic);
      strategy.svm.emit('update', {state: 'complete'});

      expect(completeEditingSpy).toHaveBeenCalledWith(graphic);
    });
  });

  describe('label', () => {
    it('adds the length of the line as label', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const lengthOfLine = 12;
      const location = new Polyline({
        spatialReference: {wkid: 2056},
        paths: [
          [
            [0, 0],
            [lengthOfLine, 0],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${lengthOfLine} m`);
    });

    it('rounds the length to 2 decimals', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      // create the second point at a known position, so we can use pythagorean theorem to calculate the length; e.g. (0/0), (2/3) ->
      // a=2, b=3
      const x = 2;
      const y = 3;
      const location = new Polyline({
        spatialReference: {wkid: 2056},
        paths: [
          [
            [0, 0],
            [x, y],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const expected = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)).toFixed(2);
      const addedGraphic = layer.graphics.getItemAt(0);
      expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${expected} m`);
    });

    it('rounds the length to km after 10001 metres', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const lengthOfLine = 10_001;
      const location = new Polyline({
        spatialReference: {wkid: 2056},
        paths: [
          [
            [0, 0],
            [lengthOfLine, 0],
          ],
        ],
      });
      const graphic = new Graphic({geometry: location});

      strategy.start();
      strategy.svm.complete();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      const addedGraphic = layer.graphics.getItemAt(0);
      const expextedLength = Math.round(lengthOfLine / 1000);
      expect((addedGraphic.symbol as TextSymbol).text).toEqual(`${expextedLength} km`);
    });
  });

  describe('mode', () => {
    it('sets mode to click', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('polyline', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriLineMeasurementStrategyWrapper(layer, mapView, lineSymbol, textSymbol, () => callbackHandler.handle());
      const spy = spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledOnceWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
