import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

export class EsriLineDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandler['completeDrawing']> {
  protected readonly tool: SupportedEsriTool = 'polyline';

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    polylineSymbol: __esri.SimpleLineSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['completeDrawing'],
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polylineSymbol = polylineSymbol;
  }
}
