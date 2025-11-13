import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {SupportedEsriTool} from '../supported-esri-tool.type';

export class EsriPointDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandler['completeDrawing']> {
  protected readonly tool: SupportedEsriTool = 'point';

  constructor(
    layer: __esri.GraphicsLayer,
    mapView: __esri.MapView,
    pointSymbol: __esri.SimpleMarkerSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['completeDrawing'],
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.pointSymbol = pointSymbol;
  }

  public override updateInternals(): void {
    // noop
  }
}
