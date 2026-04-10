import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler, DrawingCallbackHandlerArgsDrawing} from '../../interfaces/drawing-callback-handler.interface';
import {SupportedEsriTool} from '../supported-esri-tool.type';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';

export class EsriPointDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandlerArgsDrawing> {
  protected readonly tool: SupportedEsriTool = 'point';

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    pointSymbol: SimpleMarkerSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler<DrawingCallbackHandlerArgsDrawing>,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.pointSymbol = pointSymbol;
  }
}
