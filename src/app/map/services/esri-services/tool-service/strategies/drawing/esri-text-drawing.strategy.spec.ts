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
import {DrawingMode} from '../../types/drawing-mode.type';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

class EsriTextDrawingStrategyWrapper extends EsriTextDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }

  public override handleComplete(graphic: Graphic, mode: DrawingMode) {
    super.handleComplete(graphic, mode);
  }
}

const mockResourceHandle = {
  remove: vi.fn(),
};

/**
 * Note: The sketchViewModel handling is still a work in progress, as the start event (which adds a graphic) is currently not triggered.
 * As such, we do not test for the addition of the graphics which should be handled by the Esri framework any way.
 */
describe('EsriTextDrawingStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let textSymbol: TextSymbol;
  const callbackHandler: {
    handle: DrawingCallbackHandler<'completeTextDrawing'>;
  } = {
    handle(_1: Graphic | undefined, _2: DrawingMode, _3: string | undefined) {
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
    mapView.map!.layers.add(layer);
    textSymbol = new TextSymbol();
  });

  describe('cancellation', () => {
    it('does not fire the callback handler on cancel', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, callbackHandler.handle, dialog);

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'cancel', graphic: new Graphic()});

        expect(callbackSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('completion', () => {
    it('fires the callback handler on completion after the dialog is confirmed', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, callbackHandler.handle, dialog);
      const graphic = new Graphic({
        geometry: new Point({
          spatialReference: {wkid: 2056},
          x: 1337,
          y: 42,
        }),
        symbol: new TextSymbol(),
      });
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(undefined),
      } as MatDialogRef<typeof TextDrawingToolInputComponent, string>);

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic});

        expect(callbackSpy).toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('sets the label on the graphic to the input from the dialog', () => {
      const expectedText = 'Rivendell best Lego Set';
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, callbackHandler.handle, dialog);
      const graphic = new Graphic({
        geometry: new Point({
          spatialReference: {wkid: 2056},
          x: 1337,
          y: 42,
        }),
        symbol: new TextSymbol(),
      });
      vi.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(expectedText),
      } as MatDialogRef<typeof TextDrawingToolInputComponent, string>);

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic});

        expect((graphic.symbol as TextSymbol).text).toEqual(expectedText);

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('calls completeEditing on completion for editing drawings', () => {
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, callbackHandler.handle, dialog);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- spy on private method of prototype
      const completeEditingSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'completeEditing');
      const graphic = new Graphic({
        geometry: new Point({
          spatialReference: {wkid: 2056},
          x: 1337,
          y: 42,
        }),
        symbol: new TextSymbol(),
      });

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('update');

        callback({state: 'complete', graphic});

        expect(completeEditingSpy).toHaveBeenCalledWith(graphic);

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('mode', () => {
    it('sets mode to click', () => {
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, callbackHandler.handle, dialog);
      const spy = vi.spyOn(strategy.svm, 'create');

      strategy.start();

      expect(spy).toHaveBeenCalledTimes(1);

      expect(spy).toHaveBeenCalledWith('point', {mode: 'click'});
    });

    it('sets mode to update and completes without dialog', () => {
      const callbackSpy = vi.spyOn(callbackHandler, 'handle');
      const dialogSpy = vi.spyOn(dialog, 'open');
      const strategy = new EsriTextDrawingStrategyWrapper(layer, mapView, textSymbol, callbackHandler.handle, dialog);
      const svmSpy = vi.spyOn(strategy.svm, 'update');
      const graphic = new Graphic();
      const mockLabelText = 'new text';
      strategy.edit(graphic);

      expect(svmSpy).toHaveBeenCalledTimes(1);

      expect(svmSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
      strategy.updateInternals(undefined, mockLabelText);

      strategy.handleComplete(graphic, 'edit');

      expect(dialogSpy).not.toHaveBeenCalled();
      expect(callbackSpy).toHaveBeenCalledWith(graphic, 'edit', mockLabelText);
    });
  });
});
