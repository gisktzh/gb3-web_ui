import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import Polyline from '@arcgis/core/geometry/Polyline';
import {EsriElevationProfileMeasurementStrategy} from './esri-elevation-profile-measurement.strategy';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';

class EsriElevationProfileMeasurementStrategyWrapper extends EsriElevationProfileMeasurementStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is currently not triggered.
 * As such, we do not test for the addition of the graphics which should be handled by the Esri framework any way.
 */
describe('EsriElevationProfileMeasurementStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let lineSymbol: SimpleLineSymbol;
  const callbackHandler = {
    handle: () => {
      return undefined;
    },
  };

  beforeEach(() => {
    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.ElevationProfile,
    });
    mapView.map.layers.add(layer);
    lineSymbol = new SimpleLineSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriElevationProfileMeasurementStrategyWrapper(layer, mapView, lineSymbol, () => callbackHandler.handle());

      strategy.start();
      strategy.svm.emit('create', {state: 'cancel', graphic: new Graphic()});

      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('fires the callback handler on completion for creating new drawings', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriElevationProfileMeasurementStrategyWrapper(layer, mapView, lineSymbol, () => callbackHandler.handle());
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
    });
    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriElevationProfileMeasurementStrategyWrapper(layer, mapView, lineSymbol, () => callbackHandler.handle());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- spy on private method of prototype
      const completeEditingSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'completeEditing');
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

  describe('mode', () => {
    it('sets mode to click', () => {
      const strategy = new EsriElevationProfileMeasurementStrategyWrapper(layer, mapView, lineSymbol, () => callbackHandler.handle());
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('polyline', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriElevationProfileMeasurementStrategyWrapper(layer, mapView, lineSymbol, () => callbackHandler.handle());
      const spy = spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledOnceWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
