import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';
import Map from '@arcgis/core/Map';
import Graphic from '@arcgis/core/Graphic';
import {EsriTextDrawingStrategy} from './esri-text-drawing.strategy';
import {MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {of} from 'rxjs';
import {TextDrawingToolInputComponent} from '../../../../../components/text-drawing-tool-input/text-drawing-tool-input.component';
import Point from '@arcgis/core/geometry/Point';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';

class EsriTextDrawingStrategyWrapper extends EsriTextDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is currently not triggered.
 * As such, we do not test for the addition of the graphics which should be handled by the Esri framework any way.
 */
describe('EsriTextDrawingStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let textSymbol: TextSymbol;
  const callbackHandler = {
    handle: () => {
      return undefined;
    },
  };
  let dialog: MatDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [provideMockStore({})],
    });
    dialog = TestBed.inject(MatDialog);

    mapView = new MapView({map: new Map()});
    layer = new GraphicsLayer({
      id: UserDrawingLayer.Measurements,
    });
    mapView.map.layers.add(layer);
    textSymbol = new TextSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, () => callbackHandler.handle(), dialog);

      strategy.start();
      strategy.svm.emit('create', {state: 'cancel', graphic: new Graphic()});

      expect(callbackSpy).not.toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('fires the callback handler on completion after the dialog is confirmed', () => {
      const callbackSpy = spyOn(callbackHandler, 'handle');
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, () => callbackHandler.handle(), dialog);
      const graphic = new Graphic({
        geometry: new Point({
          spatialReference: {wkid: 2056},
          x: 1337,
          y: 42,
        }),
        symbol: new TextSymbol(),
      });
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<typeof TextDrawingToolInputComponent, string>);

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      expect(callbackSpy).toHaveBeenCalled();
    });

    it('sets the label on the graphic to the input from the dialog', () => {
      const expectedText = 'Rivendell best Lego Set';
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, () => callbackHandler.handle(), dialog);
      const graphic = new Graphic({
        geometry: new Point({
          spatialReference: {wkid: 2056},
          x: 1337,
          y: 42,
        }),
        symbol: new TextSymbol(),
      });
      spyOn(dialog, 'open').and.returnValue({
        afterClosed: () => of(expectedText),
      } as MatDialogRef<typeof TextDrawingToolInputComponent, string>);

      strategy.start();
      strategy.svm.emit('create', {state: 'complete', graphic: graphic});

      expect((graphic.symbol as TextSymbol).text).toEqual(expectedText);
    });

    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, () => callbackHandler.handle(), dialog);
      const completeEditingSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'completeEditing');
      const graphic = new Graphic({
        geometry: new Point({
          spatialReference: {wkid: 2056},
          x: 1337,
          y: 42,
        }),
        symbol: new TextSymbol(),
      });

      strategy.edit(graphic);
      strategy.svm.emit('update', {state: 'complete'});

      expect(completeEditingSpy).toHaveBeenCalledWith(graphic);
    });
  });

  describe('mode', () => {
    it('sets mode to click', () => {
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, () => callbackHandler.handle(), dialog);
      const spy = spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledOnceWith('point', {mode: 'click'});
    });
    it('sets mode to update', () => {
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, () => callbackHandler.handle(), dialog);
      const spy = spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      strategy.edit(graphic);

      expect(spy).toHaveBeenCalledOnceWith(graphic, {multipleSelectionEnabled: false});
    });
  });
});
