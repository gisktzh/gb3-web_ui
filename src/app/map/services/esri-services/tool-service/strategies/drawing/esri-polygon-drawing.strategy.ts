import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {AbstractEsriDrawingStrategy} from '../abstract-esri-drawing.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

type PolygonType = Extract<SupportedEsriTool, 'circle' | 'polygon' | 'rectangle'>;

export class EsriPolygonDrawingStrategy extends AbstractEsriDrawingStrategy {
  protected readonly tool: SupportedEsriTool = 'polygon';

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['complete'],
    polygonType: PolygonType,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.tool = polygonType;
  }
}
