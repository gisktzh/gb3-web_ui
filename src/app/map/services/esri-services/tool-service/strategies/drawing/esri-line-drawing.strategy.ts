import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler, DrawingCallbackHandlerArgsDrawing} from '../../interfaces/drawing-callback-handler.interface';
import {SupportedEsriTool} from '../supported-esri-tool.type';

export class EsriLineDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandlerArgsDrawing> {
  protected readonly tool: SupportedEsriTool = 'polyline';

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    polylineSymbol: __esri.SimpleLineSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler<DrawingCallbackHandlerArgsDrawing>,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polylineSymbol = polylineSymbol;
  }
}
