import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

export class EsriPointDrawingStrategy extends AbstractEsriDrawingStrategy {
  protected readonly tool: SupportedEsriTool = 'point';

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    pointSymbol: __esri.SimpleMarkerSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['complete'],
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.pointSymbol = pointSymbol;
  }
}
