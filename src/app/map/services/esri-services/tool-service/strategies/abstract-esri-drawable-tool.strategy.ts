import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {EsriSketchTool} from '../../esri.module';
import {EsriToolStrategy} from '../interfaces/strategy.interface';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';
import Graphic from '@arcgis/core/Graphic';
import {DrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import {MapConstants} from '../../../../../shared/constants/map.constants';
import {UuidUtils} from '../../../../../shared/utils/uuid.utils';

export type SupportedEsriTool = Extract<EsriSketchTool, 'polygon' | 'polyline' | 'point' | 'rectangle' | 'circle'>;

export abstract class AbstractEsriDrawableToolStrategy<
  T extends
    | DrawingCallbackHandler['completeDrawing']
    | DrawingCallbackHandler['completeMeasurement']
    | DrawingCallbackHandler['completeSelection'],
> implements EsriToolStrategy
{
  public static readonly identifierFieldName = MapConstants.DRAWING_IDENTIFIER;
  public static readonly belongsToFieldName = MapConstants.BELONGS_TO_IDENTIFIER;
  public abstract readonly internalLayerType: DrawingLayer;
  protected readonly sketchViewModel: SketchViewModel;
  protected readonly layer: GraphicsLayer;
  /**
   * Called when the SketchViewModel emits a 'complete' event.
   * @protected
   */
  protected readonly completeDrawingCallbackHandler: T;
  protected abstract readonly tool: SupportedEsriTool;

  protected constructor(layer: GraphicsLayer, mapView: MapView, completeDrawingCallbackHandler: T) {
    // todo: check whether new SketchViewModels are okay; otherwise -> singleton and reuse the model.
    this.sketchViewModel = new SketchViewModel({
      view: mapView,
      layer: layer,
      tooltipOptions: {enabled: true, helpMessage: 'Drücke Tab um Werte einzugeben'}, // todo: check how we can fix the display; seems not implemented:
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

  protected setAndGetIdentifierOnGraphic(graphic: Graphic): string {
    const identifier = UuidUtils.createUuid();
    this.setIdentifierOnGraphic(graphic, identifier);

    return identifier;
  }

  protected setIdentifierOnGraphic(graphic: Graphic, graphicIdentifier?: string): void {
    graphic.setAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName, graphicIdentifier ?? UuidUtils.createUuid());
  }

  protected setLabelTextAttributeOnGraphic(graphic: Graphic, text: string) {
    graphic.setAttribute(MapConstants.DRAWING_LABEL_IDENTIFIER, text);
  }

  protected setBelongsToAttributeOnGraphic(graphic: __esri.Graphic, belongsToGraphicUuid: string) {
    graphic.setAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName, belongsToGraphicUuid);
  }
}
