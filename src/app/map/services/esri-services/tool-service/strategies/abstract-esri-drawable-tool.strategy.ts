import {DrawingCallbackHandler} from './../interfaces/drawing-callback-handler.interface';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {EsriToolStrategy} from '../interfaces/strategy.interface';
import {DrawingCallbackHandlerArgsType} from '../interfaces/drawing-callback-handler.interface';
import Graphic from '@arcgis/core/Graphic';
import {DrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import {MapConstants} from '../../../../../shared/constants/map.constants';
import {UuidUtils} from '../../../../../shared/utils/uuid.utils';
import {SupportedEsriTool} from './supported-esri-tool.type';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

export abstract class AbstractEsriDrawableToolStrategy<
  ArgsType extends DrawingCallbackHandlerArgsType,
  SymbolType extends MapDrawingSymbol = MapDrawingSymbol,
> implements EsriToolStrategy
{
  public static readonly identifierFieldName = MapConstants.DRAWING_IDENTIFIER;
  public static readonly belongsToFieldName = MapConstants.BELONGS_TO_IDENTIFIER;
  public static readonly toolFieldName = MapConstants.TOOL_IDENTIFIER;
  public abstract readonly internalLayerType: DrawingLayer;
  protected readonly sketchViewModel: SketchViewModel;
  protected readonly layer: GraphicsLayer;
  /**
   * Called when the SketchViewModel emits a 'complete' event.
   * @protected
   */
  protected readonly completeDrawingCallbackHandler: DrawingCallbackHandler<ArgsType, SymbolType>;
  protected abstract readonly tool: SupportedEsriTool;

  protected constructor(
    layer: GraphicsLayer,
    mapView: MapView,
    completeDrawingCallbackHandler: DrawingCallbackHandler<ArgsType, SymbolType>,
  ) {
    // todo: check whether new SketchViewModels are okay; otherwise -> singleton and reuse the model.
    this.sketchViewModel = new SketchViewModel({
      view: mapView,
      layer: layer,
      tooltipOptions: {enabled: false}, // todo: check how we can fix the display; seems not implemented:
      // https://community.esri.com/t5/arcgis-javascript-maps-sdk-questions/how-to-show-cursor-tooltips-when-a-sketch-tool-is/td-p/1276503
      updateOnGraphicClick: false,
    });

    this.layer = layer;
    this.completeDrawingCallbackHandler = completeDrawingCallbackHandler;
  }

  public cancel() {
    this.sketchViewModel.cancel();
  }

  public abstract start(): void;

  public abstract edit(graphic: __esri.Graphic): void;

  protected setAndGetIdentifierOnGraphic(graphic: Graphic): string {
    const identifier = UuidUtils.createUuid();
    this.setIdentifierOnGraphic(graphic, identifier);

    return identifier;
  }

  protected setIdentifierOnGraphic(graphic: Graphic, graphicIdentifier?: string): void {
    // If the graphic does not have an id (i.e when it newly created), we need to create one
    if (!graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName)) {
      const identifier = graphicIdentifier ?? UuidUtils.createUuid();
      graphic.setAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName, identifier);
      graphic.setAttribute(AbstractEsriDrawableToolStrategy.toolFieldName, this.tool);
    }
  }

  protected setLabelTextAttributeOnGraphic(graphic: Graphic, text: string) {
    graphic.setAttribute(MapConstants.DRAWING_LABEL_IDENTIFIER, text);
  }

  protected setBelongsToAttributeOnGraphic(graphic: __esri.Graphic, belongsToGraphicUuid: string) {
    graphic.setAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName, belongsToGraphicUuid);
  }

  // When deleting a feature during edit, the "complete"-state is still triggered. Therefore, we need to check whether a feature still exists on the layer
  protected checkIfGraphicExistsOnLayer(graphicIdentifier: string): boolean {
    return this.layer.graphics.some(
      (existingGraphic) => existingGraphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName) === graphicIdentifier,
    );
  }
}
