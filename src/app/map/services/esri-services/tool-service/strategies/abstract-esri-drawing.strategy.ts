import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';
import {
  DrawingCallbackHandlerArgsDrawing,
  DrawingCallbackHandlerArgsLists,
  DrawingCallbackHandlerArgsSymbolDrawing,
  DrawingCallbackHandlerArgsTextDrawing,
  DrawingInternalUpdateArgs,
} from '../interfaces/drawing-callback-handler.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import Graphic from '@arcgis/core/Graphic';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

export abstract class AbstractEsriDrawingStrategy<
  CallbackType extends DrawingCallbackHandlerArgsDrawing | DrawingCallbackHandlerArgsTextDrawing | DrawingCallbackHandlerArgsSymbolDrawing,
  ArgsType extends DrawingInternalUpdateArgs[CallbackType] = DrawingInternalUpdateArgs[CallbackType],
  SymbolType extends MapDrawingSymbol = MapDrawingSymbol,
> extends AbstractEsriDrawableToolStrategy<CallbackType, SymbolType> {
  public readonly internalLayerType: UserDrawingLayer = UserDrawingLayer.Drawings;

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
    this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});

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
   */
  public updateInternals(..._: ArgsType): void {
    // noop
  }

  protected handleComplete(...args: DrawingCallbackHandlerArgsLists<SymbolType>[CallbackType]) {
    const graphic = args[0];
    if (graphic) {
      this.setIdentifierOnGraphic(graphic);
    }

    this.completeDrawingCallbackHandler(...args);
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
