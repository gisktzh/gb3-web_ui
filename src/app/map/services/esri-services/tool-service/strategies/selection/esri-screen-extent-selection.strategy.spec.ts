import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriScreenExtentSelectionStrategy} from './esri-screen-extent-selection.strategy';
import {TestBed} from '@angular/core/testing';
import Extent from '@arcgis/core/geometry/Extent';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';

describe('EsriScreenExtentSelectionStrategy', () => {
  const callbackHandler = {
    handle: (selection: DataDownloadSelection | undefined) => {
      return selection;
    },
  };

  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    fillSymbol = new SimpleFillSymbol();
  });

  describe('cancellation', () => {
    it('does clear the layer and does not dispatch anything', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const extent = new Extent();
      const strategy = new EsriScreenExtentSelectionStrategy(layer, fillSymbol, (selection) => callbackHandler.handle(selection), extent);
      const layerSpy = spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('dispatches a new selection', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const extent = new Extent();
      const strategy = new EsriScreenExtentSelectionStrategy(layer, fillSymbol, (selection) => callbackHandler.handle(selection), extent);

      strategy.start();
      expect(callbackSpy).toHaveBeenCalledWith(jasmine.objectContaining({type: 'polygon'}));
    });
  });
});
