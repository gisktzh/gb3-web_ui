import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler, DrawingMode} from '../interfaces/drawing-callback-handler.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import Graphic from '@arcgis/core/Graphic';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {HANDLE_GROUP_KEY} from '../esri-tool.service';

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
            this.handleComplete(graphic);
            break;
        }
      },
    );
  }

  public edit(graphic: __esri.Graphic) {
    void this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});

    const deleteHandle = reactiveUtils.on(
      () => this.sketchViewModel,
      'delete',
      () => {
        this.handleComplete(graphic, 'delete');
      },
    );

    const editHandle = reactiveUtils.on(
      () => this.sketchViewModel,
      'update',
      ({state}) => {
        let graphicIdentifier: string;
        switch (state) {
          case 'active':
          case 'start':
          case 'cancel':
            break; // currently, these events do not trigger any action
          case 'complete':
            if (
              this.layer.graphics.find((g) => g.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName) === graphicIdentifier)
            ) {
              graphicIdentifier = graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName);
              this.handleComplete(graphic);
            }
            break;
        }
      },
    );

    this.sketchViewModel.view.addHandles([editHandle, deleteHandle], HANDLE_GROUP_KEY);
  }

  protected handleComplete(graphic: Graphic, mode: DrawingMode = 'add', labelText?: string) {
    this.setIdentifierOnGraphic(graphic);
    this.completeDrawingCallbackHandler(graphic, mode, labelText);
  }
}
