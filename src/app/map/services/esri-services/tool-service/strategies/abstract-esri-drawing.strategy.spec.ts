import {SupportedEsriTool} from 'src/app/map/services/esri-services/tool-service/strategies/supported-esri-tool.type';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {AbstractEsriDrawingStrategy} from './abstract-esri-drawing.strategy';
import Graphic from '@arcgis/core/Graphic';
import {EsriPointDrawingStrategy} from './drawing/esri-point-drawing.strategy';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {MapViewWithMap} from '../../types/esri-mapview-with-map.type';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';

const MOCK_TOOL_NAME = 'point';

class EsriPointDrawingStrategyWrapper extends EsriPointDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }

  public override tool: SupportedEsriTool = MOCK_TOOL_NAME;
}

describe('AbstractEsriDrawingStrategy', () => {
  let mapView: MapViewWithMap;
  let layer: GraphicsLayer;
  let pointSymbol: SimpleMarkerSymbol;
  let strategy: EsriPointDrawingStrategyWrapper;
  const callbackHandler = {
    handle: () => {
      return undefined;
    },
  };

  beforeEach(() => {
    mapView = new MapView({map: new Map()}) as MapViewWithMap;
    layer = new GraphicsLayer({
      id: UserDrawingLayer.Measurements,
    });
    mapView.map.layers.add(layer);
    pointSymbol = new SimpleMarkerSymbol();
    strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
  });

  describe('start', () => {
    it('should call `create` on the sketchViewModel, attach an appropriate listener and not call `handleComplete` on create event with state `active`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'create');
      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');

      strategy.start();

      strategy.svm.emit('create', {
        state: 'active',
        graphic,
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
      expect(handleCompleteSpy).not.toHaveBeenCalled();
    });

    it('should call `create` on the sketchViewModel, attach an appropriate listener and not call `handleComplete` on create event with state `start`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'create');
      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');

      strategy.start();

      strategy.svm.emit('create', {
        state: 'start',
        graphic,
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
      expect(handleCompleteSpy).not.toHaveBeenCalled();
    });

    it('should call `create` on the sketchViewModel, attach an appropriate listener and not call `handleComplete` on create event with state `cancel`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'create');
      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');

      strategy.start();

      strategy.svm.emit('create', {
        state: 'cancel',
        graphic,
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
      expect(handleCompleteSpy).not.toHaveBeenCalled();
    });

    it('should call `create` on the sketchViewModel, attach an appropriate listener and call `handleComplete` on create event with state `complete`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'create');
      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');

      strategy.start();

      strategy.svm.emit('create', {
        state: 'complete',
        graphic,
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(MOCK_TOOL_NAME, {mode: 'click'});
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'add');
    });
  });

  describe('edit', () => {
    it('should call `update` on the sketchViewModel, attach an appropriate listener and not call `completeEditing` on update event with state `active`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'update');
      const completeEditingSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'completeEditing');

      strategy.edit(graphic);

      strategy.svm.emit('update', {
        state: 'active',
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
      expect(completeEditingSpy).not.toHaveBeenCalled();
    });

    it('should call `update` on the sketchViewModel, attach an appropriate listener and not call `completeEditing` on update event with state `start`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'update');
      const completeEditingSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'completeEditing');

      strategy.edit(graphic);

      strategy.svm.emit('update', {
        state: 'start',
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
      expect(completeEditingSpy).not.toHaveBeenCalled();
    });

    it('should call `update` on the sketchViewModel, attach an appropriate listener and call `completeEditing` on update event with state `complete`', () => {
      const graphic = new Graphic();

      const sketchViewModelSpy = spyOn<any>(SketchViewModel.prototype, 'update');
      const completeEditingSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'completeEditing');

      strategy.edit(graphic);

      strategy.svm.emit('update', {
        state: 'complete',
      });

      expect(sketchViewModelSpy).toHaveBeenCalledWith(graphic, {multipleSelectionEnabled: false});
      expect(completeEditingSpy).toHaveBeenCalledWith(graphic);
    });
  });

  describe('completeEditing', () => {
    it('should call handleComplete with the correct arguments if the graphic does not exist', () => {
      const graphic = new Graphic();

      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(false);

      strategy['completeEditing'](graphic); // eslint-disable-line @typescript-eslint/dot-notation -- Private property access

      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'delete');
    });

    it('should call handleComplete with the correct arguments if the graphic exists', () => {
      const graphic = new Graphic();

      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(true);

      strategy['completeEditing'](graphic); // eslint-disable-line @typescript-eslint/dot-notation -- Private property access

      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'edit');
    });

    it('should call handleComplete with the correct arguments if the graphic exists and the label exists', () => {
      const symbol = new TextSymbol({text: 'test'});
      const graphic = new Graphic({symbol});

      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(true);

      strategy['completeEditing'](graphic); // eslint-disable-line @typescript-eslint/dot-notation -- Private property access

      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'edit');
    });
  });
});
