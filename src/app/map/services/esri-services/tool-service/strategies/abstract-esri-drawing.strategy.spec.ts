/* eslint-disable @typescript-eslint/no-explicit-any */
import {SupportedEsriTool} from 'src/app/map/services/esri-services/tool-service/strategies/supported-esri-tool.type';
import {AbstractEsriDrawingStrategy} from './abstract-esri-drawing.strategy';
import Graphic from '@arcgis/core/Graphic';
import {EsriPointDrawingStrategy} from './drawing/esri-point-drawing.strategy';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';

const MOCK_TOOL_NAME = 'point';

const mockResourceHandle = {
  remove: vi.fn(),
};

class EsriPointDrawingStrategyWrapper extends EsriPointDrawingStrategy {
  public override tool: SupportedEsriTool = MOCK_TOOL_NAME;

  public get svm() {
    return this.sketchViewModel;
  }
}

describe('AbstractEsriDrawingStrategy', () => {
  let mapView: MapView;
  let layer: GraphicsLayer;
  let pointSymbol: SimpleMarkerSymbol;
  let strategy: EsriPointDrawingStrategyWrapper;
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
    mapView.map!.layers.add(layer);
    pointSymbol = new SimpleMarkerSymbol();
    strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
  });

  describe('start', () => {
    it('should call `create` on the sketchViewModel, attach an appropriate listener and not call `handleComplete` on create event with state `active`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'create');
      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'active', graphic});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
        expect(handleCompleteSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('should call `create` on the sketchViewModel, attach an appropriate listener and not call `handleComplete` on create event with state `start`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'create');
      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'start', graphic});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
        expect(handleCompleteSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('should call `create` on the sketchViewModel, attach an appropriate listener and not call `handleComplete` on create event with state `cancel`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'create');
      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'cancel', graphic});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
        expect(handleCompleteSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('should call `create` on the sketchViewModel, attach an appropriate listener and call `handleComplete` on create event with state `complete`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'create');
      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('create');

        callback({state: 'complete', graphic});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
        expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'add');

        return mockResourceHandle;
      });

      strategy.start();

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should call `update` on the sketchViewModel, attach an appropriate listener and not call `completeEditing` on update event with state `active`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'update');
      const completeEditingSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'completeEditing');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('update');

        callback({state: 'active'});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
        expect(completeEditingSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('should call `update` on the sketchViewModel, attach an appropriate listener and not call `completeEditing` on update event with state `start`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'update');
      const completeEditingSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'completeEditing');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('update');

        callback({state: 'start'});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
        expect(completeEditingSpy).not.toHaveBeenCalled();

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });

    it('should call `update` on the sketchViewModel, attach an appropriate listener and call `completeEditing` on update event with state `complete`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = vi.spyOn(SketchViewModel.prototype as any, 'update');
      const completeEditingSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'completeEditing');

      const reactiveSpy = vi.spyOn(reactiveUtils, 'on').mockImplementation((getTarget, eventName, callback) => {
        expect(getTarget()).toEqual(strategy.svm);
        expect(eventName).toEqual('update');

        callback({state: 'complete'});

        expect(sketchViewModelSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
        expect(completeEditingSpy).toHaveBeenCalledWith(graphic);

        return mockResourceHandle;
      });

      strategy.edit(graphic);

      expect(reactiveSpy).toHaveBeenCalled();
    });
  });

  describe('completeEditing', () => {
    it('should call handleComplete with the correct arguments if the graphic does not exist', () => {
      const graphic = new Graphic();

      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');
      const checkGraphicSpy = vi
        .spyOn(Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype), 'checkIfGraphicExistsOnLayer')
        .mockReturnValue(false);

      strategy['completeEditing'](graphic); // eslint-disable-line @typescript-eslint/dot-notation -- Private property access

      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'delete');
    });

    it('should call handleComplete with the correct arguments if the graphic exists', () => {
      const graphic = new Graphic();

      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');
      const checkGraphicSpy = vi
        .spyOn(Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype), 'checkIfGraphicExistsOnLayer')
        .mockReturnValue(true);

      strategy['completeEditing'](graphic); // eslint-disable-line @typescript-eslint/dot-notation -- Private property access

      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'edit');
    });

    it('should call handleComplete with the correct arguments if the graphic exists and the label exists', () => {
      const symbol = new TextSymbol({text: 'test'});
      const graphic = new Graphic({symbol});

      const handleCompleteSpy = vi.spyOn(AbstractEsriDrawingStrategy.prototype as any, 'handleComplete');
      const checkGraphicSpy = vi
        .spyOn(Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype), 'checkIfGraphicExistsOnLayer')
        .mockReturnValue(true);

      strategy['completeEditing'](graphic); // eslint-disable-line @typescript-eslint/dot-notation -- Private property access

      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'edit');
    });
  });
});
