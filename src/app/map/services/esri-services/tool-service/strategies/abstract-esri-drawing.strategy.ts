import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import Graphic from '@arcgis/core/Graphic';

export abstract class AbstractEsriDrawingStrategy<
  T extends DrawingCallbackHandler['completeDrawing'],
> extends AbstractEsriDrawableToolStrategy<T> {
  public readonly internalLayerType: UserDrawingLayer = UserDrawingLayer.Drawings;

  protected constructor(layer: GraphicsLayer, mapView: MapView, completeCallbackHandler: T) {
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
          this.handleComplete(graphic);
          break;
      }
    });
  }

  public edit(graphic: __esri.Graphic) {
    void this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});
  }

  protected handleComplete(graphic: Graphic, labelText?: string) {
    this.setIdentifierOnGraphic(graphic);
    this.completeDrawingCallbackHandler(graphic, labelText);
  }
}
