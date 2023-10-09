import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';
import {InternalDrawingLayer} from '../../../../../../shared/enums/drawing-layer.enum';

export abstract class AbstractEsriSelectionStrategy extends AbstractEsriDrawableToolStrategy {
  public readonly internalLayerType: InternalDrawingLayer = InternalDrawingLayer.Selection;
  protected constructor(layer: GraphicsLayer, mapView: MapView, completeCallbackHandler: DrawingCallbackHandler['complete']) {
    super(layer, mapView, completeCallbackHandler);
  }

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});
    this.sketchViewModel.on('create', ({state, graphic}) => {
      switch (state) {
        case 'active':
        case 'start':
        case 'cancel':
          break; // currently, these events do not trigger any action
        case 'complete':
          this.setIdentifierOnGraphic(graphic);
          this.completeDrawingCallbackHandler(graphic);
          break;
      }
    });
  }
}
