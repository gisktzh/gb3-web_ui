import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import MapView from '@arcgis/core/views/MapView';
import {AbstractEsriDrawableToolStrategy, SupportedEsriTool} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';

type PolygonType = Extract<SupportedEsriTool, 'circle' | 'polygon' | 'rectangle'>;

export class EsriPolygonSelectionStrategy extends AbstractEsriDrawableToolStrategy {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});
    this.sketchViewModel.on('create', ({state, graphic}) => {
      switch (state) {
        case 'cancel':
        case 'active':
          break; // currently, this events do not trigger any action
        case 'start':
          // remove all old selections before starting a new one
          this.layer.removeAll();
          break;
        case 'complete':
          this.setIdentifierOnGraphic(graphic);
          this.completeDrawingCallbackHandler(graphic);
          break;
      }
    });
  }
  protected readonly tool: SupportedEsriTool = 'polygon';

  constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    polygonSymbol: SimpleFillSymbol,
    completeDrawingCallbackHandler: DrawingCallbackHandler['complete'],
    polygonType: PolygonType,
  ) {
    super(layer, mapView, completeDrawingCallbackHandler);

    layer.removeAll();
    this.sketchViewModel.polygonSymbol = polygonSymbol;
    this.tool = polygonType;
  }
}
