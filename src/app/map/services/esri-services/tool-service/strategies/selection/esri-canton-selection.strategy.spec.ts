import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriCantonSelectionStrategy} from './esri-canton-selection.strategy';
import {TestBed} from '@angular/core/testing';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';

describe('EsriCantonSelectionStrategy', () => {
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
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const strategy = new EsriCantonSelectionStrategy(layer, fillSymbol, callbackHandler);
      const layerRemoveAllSpy = spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('dispatches a new selection', () => {
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const strategy = new EsriCantonSelectionStrategy(layer, fillSymbol, callbackHandler);

      strategy.start();
      expect(completeCallbackHandlerSpy).toHaveBeenCalledWith(jasmine.objectContaining({type: 'select-canton'}));
    });
  });
});
