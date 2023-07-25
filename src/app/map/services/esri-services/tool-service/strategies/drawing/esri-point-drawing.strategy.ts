import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {AbstractEsriDrawingStrategy} from './abstract-esri-drawing.strategy';

export class EsriPointDrawingStrategy extends AbstractEsriDrawingStrategy {
  protected readonly tool: SupportedEsriTool = 'point';

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    pointSymbol: __esri.SimpleMarkerSymbol,
    completeCallbackHandler: () => void,
  ) {
    super(layer, mapView, completeCallbackHandler);

    this.sketchViewModel.pointSymbol = pointSymbol;
  }
}
