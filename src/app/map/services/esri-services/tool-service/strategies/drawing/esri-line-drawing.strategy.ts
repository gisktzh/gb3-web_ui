import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {AbstractEsriDrawingStrategy} from './abstract-esri-drawing.strategy';

export class EsriLineDrawingStrategy extends AbstractEsriDrawingStrategy {
  protected readonly tool: SupportedEsriTool = 'polyline';

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    polylineSymbol: __esri.SimpleLineSymbol,
    completeCallbackHandler: () => void,
  ) {
    super(layer, mapView, completeCallbackHandler);

    this.sketchViewModel.polylineSymbol = polylineSymbol;
  }
}
