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

class EsriPolygonSelectionStrategyWrapper extends EsriPolygonSelectionStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

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
    mapView.map.layers.add(layer);
    fillSymbol = new SimpleFillSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'polygon',
        2056,
      );

      strategy.start();
      strategy.svm.emit('create', {state: 'cancel', graphic: new Graphic()});

      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });

  describe('start', () => {
    it('removes all existing layers on start', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriPolygonSelectionStrategyWrapper(
        layer,
        mapView,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        'polygon',
        2056,
      );
      const layerRemoveAllSpy = spyOn(layer, 'removeAll');

      strategy.start();
      strategy.svm.emit('create', {state: 'start'});
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('fires the callback handler on completion', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
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

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic});

      expect(callbackSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({type: 'polygon'}));
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
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('rectangle', {mode: 'click'});
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
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('circle', {mode: 'click'});
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
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('polygon', {mode: 'click'});
    });
  });
});
