import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {SupportedEsriPolygonTool, SupportedEsriTool} from '../supported-esri-tool.type';

export class EsriPolygonDrawingStrategy extends AbstractEsriDrawingStrategy<DrawingCallbackHandler['completeDrawing']> {
  protected readonly tool: SupportedEsriTool = 'polygon';

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['completeDrawing'],
    polygonType: SupportedEsriPolygonTool,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.tool = polygonType;
  }

  public override updateInternals(): void {
    // noop
  }
}
