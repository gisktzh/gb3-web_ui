import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import Graphic from '@arcgis/core/Graphic';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {DrawingMode} from '../types/drawing-mode.type';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';

export abstract class AbstractEsriDrawingStrategy<
  T extends DrawingCallbackHandler['completeDrawing'],
> extends AbstractEsriDrawableToolStrategy<T> {
  public readonly internalLayerType: UserDrawingLayer = UserDrawingLayer.Drawings;

  protected constructor(layer: GraphicsLayer, mapView: MapView, completeCallbackHandler: T) {
    super(layer, mapView, completeCallbackHandler);
  }

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});

    reactiveUtils.on(
      () => this.sketchViewModel,
      'create',
      ({state, graphic}) => {
        switch (state) {
          case 'active':
          case 'start':
          case 'cancel':
            break; // currently, these events do not trigger any action
          case 'complete':
            this.handleComplete(graphic, 'add');
            break;
        }
      },
    );
  }

  public edit(graphic: __esri.Graphic) {
    void this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});

    reactiveUtils.on(
      () => this.sketchViewModel,
      'update',
      ({state}) => {
        switch (state) {
          case 'active':
          case 'start':
          case 'cancel':
            break; // currently, these events do not trigger any action
          case 'complete':
            this.completeEditing(graphic);
            break;
        }
      },
    );
  }

  protected handleComplete(graphic: Graphic, mode: DrawingMode, labelText?: string) {
    this.setIdentifierOnGraphic(graphic);
    this.completeDrawingCallbackHandler(graphic, mode, labelText);
  }

  private completeEditing(graphic: Graphic) {
    const graphicIdentifier = graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName);
    // checks if the graphic still exists in the layer, i. e if it was not deleted during edit
    const graphicExistsOnLayer = this.checkIfGraphicExistsOnLayer(graphicIdentifier);
    if (!graphicExistsOnLayer) {
      this.handleComplete(graphic, 'delete');
      return;
    }
    const labelText = graphic.symbol instanceof TextSymbol ? graphic.symbol.text : undefined;
    this.handleComplete(graphic, 'edit', labelText);
  }
}
