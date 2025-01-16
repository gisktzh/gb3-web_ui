import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {EsriBoundingBoxSelectionStrategy} from './esri-bounding-box-selection.strategy';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {ConfigService} from '../../../../../../shared/services/config.service';
import {Observable, of} from 'rxjs';
import {CantonWithGeometry} from '../../../../../../shared/interfaces/gb3-geoshop-product.interface';
import {MinimalGeometriesUtils} from '../../../../../../testing/map-testing/minimal-geometries.utils';
import {DataDownloadSelection} from '../../../../../../shared/interfaces/data-download-selection.interface';
import {provideMockStore} from '@ngrx/store/testing';

describe('EsriCantonSelectionStrategy', () => {
  let layer: GraphicsLayer;
  let fillSymbol: SimpleFillSymbol;
  const callbackHandler = {
    handle: (selection: DataDownloadSelection | undefined) => {
      return selection;
    },
  };
  let configService: ConfigService;
  let cantonWithGeometry$: Observable<CantonWithGeometry | undefined>;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideMockStore()]});
    layer = new GraphicsLayer({
      id: InternalDrawingLayer.Selection,
    });
    fillSymbol = new SimpleFillSymbol();
    configService = TestBed.inject(ConfigService);
  });

  describe('cancellation', () => {
    it('does clear the layer and does not dispatch anything', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      cantonWithGeometry$ = of(undefined);
      const strategy = new EsriBoundingBoxSelectionStrategy(
        layer,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        cantonWithGeometry$,
        'canton',
        configService,
      );
      const layerRemoveAllSpy = spyOn(layer, 'removeAll');

      strategy.cancel();
      expect(layerRemoveAllSpy).toHaveBeenCalledTimes(1);
      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('dispatches a new selection', fakeAsync(() => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      cantonWithGeometry$ = of({boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)});
      const strategy = new EsriBoundingBoxSelectionStrategy(
        layer,
        fillSymbol,
        (selection) => callbackHandler.handle(selection),
        cantonWithGeometry$,
        'canton',
        configService,
      );

      strategy.start();
      tick();

      expect(callbackSpy).toHaveBeenCalledWith(jasmine.objectContaining({type: 'canton'}));
    }));
  });
});
