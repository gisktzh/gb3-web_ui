import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import Graphic from '@arcgis/core/Graphic';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {DrawingMode} from '../types/drawing-mode.type';
import {Gb3StyleRepresentation} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {MapDrawingSymbol} from '../../types/map-drawing-symbol.type';

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
      async ({state, graphic}: {state: __esri.SketchViewModelCreateEvent['state']; graphic: Graphic}) => {
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
      ({state}: {state: __esri.SketchViewModelUpdateEvent['state']}) => {
        switch (state) {
          case 'active':
          case 'start':
            break;
          case 'complete':
            this.completeEditing(graphic);
            break;
        }
      },
    );
  }

  /**
   * When adding drawings, the strategies usually take care of the internals themselves via dialogs.
   * However, when editing, the internals that are late on being passed to `handleComplete` need to be taken
   * care of in the strategy, too, so we inject them via a generalized setter. Most drawing strategies don't
   * actually implement any logic here, though.
   *
   * TODO: Generalize this via a generic and a type hint.
   */
  public abstract updateInternals(style: Gb3StyleRepresentation, labelText?: string, mapDrawingSymbol?: MapDrawingSymbol): void;

  protected handleComplete(
    graphic: Graphic,
    mode: DrawingMode,
    labelText?: string,
    mapDrawingSymbol?: MapDrawingSymbol,
    symbolSize?: number,
    symbolRotation?: number,
  ) {
    this.setIdentifierOnGraphic(graphic);
    this.completeDrawingCallbackHandler(graphic, mode, labelText, mapDrawingSymbol, symbolSize, symbolRotation);
  }

  private completeEditing(graphic: Graphic) {
    const graphicIdentifier = graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName);
    // checks if the graphic still exists in the layer, i.e. if it was not deleted during edit
    const graphicExistsOnLayer = this.checkIfGraphicExistsOnLayer(graphicIdentifier);
    if (!graphicExistsOnLayer) {
      this.handleComplete(graphic, 'delete');
      return;
    }

    this.handleComplete(graphic, 'edit');
  }
}
