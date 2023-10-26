import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriScreenExtentSelectionStrategy} from './esri-screen-extent-selection.strategy';
import {TestBed} from '@angular/core/testing';
import Extent from '@arcgis/core/geometry/Extent';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';

describe('EsriScreenExtentSelectionStrategy', () => {
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
  const callbackHandler: SelectionCallbackHandler = {
    complete: () => {},
    abort: () => {},
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    fillSymbol = new SimpleFillSymbol();
  });

  describe('cancellation', () => {
    it('does clear the layer and does not dispatch anything', () => {
      const extent = new Extent();
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const strategy = new EsriScreenExtentSelectionStrategy(layer, fillSymbol, callbackHandler, extent);
      const layerSpy = spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('dispatches a new selection', () => {
      const extent = new Extent();
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const strategy = new EsriScreenExtentSelectionStrategy(layer, fillSymbol, callbackHandler, extent);

      strategy.start();
      expect(completeCallbackHandlerSpy).toHaveBeenCalledWith(jasmine.objectContaining({type: 'select-section'}));
    });
  });
});
