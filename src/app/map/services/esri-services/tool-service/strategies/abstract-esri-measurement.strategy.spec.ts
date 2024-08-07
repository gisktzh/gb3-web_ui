import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {EsriPointMeasurementStrategy} from './measurement/esri-point-measurement.strategy';
import {AbstractEsriMeasurementStrategy} from './abstract-esri-measurement.strategy';
import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';

class EsriPointMeasurementStrategyWrapper extends EsriPointMeasurementStrategy {
  public get svm() {
    return this.sketchViewModel;
  }
}

describe('AbstractEsriMeasurementStrategy', () => {
  describe('completeEditing', () => {
    let mapView: MapView;
    let layer: GraphicsLayer;
    let pointSymbol: SimpleMarkerSymbol;
    let strategy: EsriPointMeasurementStrategy;
    let textSymbol: TextSymbol;
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
      textSymbol = new TextSymbol({text: 'test'});
      strategy = new EsriPointMeasurementStrategyWrapper(layer, mapView, pointSymbol, textSymbol, () => callbackHandler.handle());
    });
    it('should call completeDrawingCallbackHandler with the correct arguments if the graphic does not exist', () => {
      const graphic = new Graphic();
      const handleCompleteSpy = spyOn<any>(strategy, 'completeDrawingCallbackHandler');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriMeasurementStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(false);
      strategy['completeEditing'](graphic);
      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, graphic, '', 'delete');
    });
    it('should call completeDrawingCallbackHandler with the correct arguments if the graphic exists and is a label', () => {
      const graphic = new Graphic();
      graphic.symbol = textSymbol;
      graphic.setAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName, '123');
      const belongsToGraphic = new Graphic();
      belongsToGraphic.setAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName, '123');
      layer.add(belongsToGraphic);
      const handleCompleteSpy = spyOn<any>(strategy, 'completeDrawingCallbackHandler');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriMeasurementStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(true);
      strategy['completeEditing'](graphic);
      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(belongsToGraphic, graphic, 'test', 'edit');
    });
    it('should call completeDrawingCallbackHandler with the correct arguments if the graphic exists and is a geometry', () => {
      const graphic = new Graphic();

      const labelGraphic = new Graphic();
      const createLabelSpy = spyOn<any>(strategy, 'createLabelForGeometry').and.returnValue({
        label: labelGraphic,
        labelText: 'test',
      });
      const handleCompleteSpy = spyOn<any>(strategy, 'completeDrawingCallbackHandler');
      const checkGraphicSpy = spyOn(
        Object.getPrototypeOf(AbstractEsriMeasurementStrategy.prototype),
        'checkIfGraphicExistsOnLayer',
      ).and.returnValue(true);
      strategy['completeEditing'](graphic);
      expect(checkGraphicSpy).toHaveBeenCalled();
      expect(createLabelSpy).toHaveBeenCalled();
      expect(handleCompleteSpy).toHaveBeenCalledWith(graphic, labelGraphic, 'test', 'edit');
    });
  });
});
