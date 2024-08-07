import {AbstractEsriDrawingStrategy} from './abstract-esri-drawing.strategy';
import Graphic from '@arcgis/core/Graphic';
import {EsriPointDrawingStrategy} from './drawing/esri-point-drawing.strategy';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';

class EsriPointDrawingStrategyWrapper extends EsriPointDrawingStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

describe('AbstractEsriDrawingStrategy', () => {
  describe('completeEditing', () => {
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
      mapView.map.layers.add(layer);
      pointSymbol = new SimpleMarkerSymbol();
      strategy = new EsriPointDrawingStrategyWrapper(layer, mapView, pointSymbol, () => callbackHandler.handle());
    });
    it('should call handleComplete with the correct arguments if the graphic does not exist', () => {
      const graphic = new Graphic();
      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(false);
      strategy['completeEditing'](graphic);
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
      strategy['completeEditing'](graphic);
      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'edit', undefined);
    });
    it('should call handleComplete with the correct arguments if the graphic exists and the label exists', () => {
      const symbol = new TextSymbol({text: 'test'});
      const graphic = new Graphic({symbol});
      const handleCompleteSpy = spyOn<any>(AbstractEsriDrawingStrategy.prototype, 'handleComplete');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriDrawingStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(true);
      strategy['completeEditing'](graphic);
      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, 'edit', 'test');
    });
  });
});
