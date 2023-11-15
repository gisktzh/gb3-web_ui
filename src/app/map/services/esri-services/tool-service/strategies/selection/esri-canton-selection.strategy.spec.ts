import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriCantonSelectionStrategy} from './esri-canton-selection.strategy';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {SelectionCallbackHandler} from '../../interfaces/selection-callback-handler.interface';
import {ConfigService} from '../../../../../../shared/services/config.service';
import {Observable, of} from 'rxjs';
import {CantonWithGeometry} from '../../../../../../shared/interfaces/gb3-geoshop-product.interface';
import {MinimalGeometriesUtils} from '../../../../../../testing/map-testing/minimal-geometries.utils';

describe('EsriCantonSelectionStrategy', () => {
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
  const callbackHandler: SelectionCallbackHandler = {
    complete: () => {},
    abort: () => {},
  };
  let configService: ConfigService;
  let cantonWithGeometry$: Observable<CantonWithGeometry | undefined>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    fillSymbol = new SimpleFillSymbol();
    configService = TestBed.inject(ConfigService);
    cantonWithGeometry$ = of(undefined);
  });

  describe('cancellation', () => {
    it('does clear the layer and does not dispatch anything', () => {
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      const strategy = new EsriCantonSelectionStrategy(layer, fillSymbol, callbackHandler, configService, cantonWithGeometry$);
      const layerRemoveAllSpy = spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(completeCallbackHandlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('dispatches a new selection', fakeAsync(() => {
      const completeCallbackHandlerSpy = spyOn(callbackHandler, 'complete');
      cantonWithGeometry$ = of({boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)});
      const strategy = new EsriCantonSelectionStrategy(layer, fillSymbol, callbackHandler, configService, cantonWithGeometry$);

      strategy.start();
      tick();

      expect(completeCallbackHandlerSpy).toHaveBeenCalledWith(jasmine.objectContaining({type: 'select-canton'}));
    }));
  });
});
