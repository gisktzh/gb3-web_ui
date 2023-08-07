import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {EsriSketchTool} from '../../esri.module';
import {EsriToolStrategy} from '../interfaces/strategy.interface';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';

export type SupportedEsriTool = Extract<EsriSketchTool, 'polygon' | 'polyline' | 'point' | 'rectangle' | 'circle'>;

export abstract class AbstractEsriDrawableToolStrategy implements EsriToolStrategy {
  protected readonly sketchViewModel: SketchViewModel;
  protected readonly layer: GraphicsLayer;
  /**
   * Called when the SketchViewModel emits a 'complete' event.
   * @protected
   */
  protected readonly completeDrawingCallbackHandler: DrawingCallbackHandler['complete'];
  protected abstract readonly tool: SupportedEsriTool;

  protected constructor(layer: GraphicsLayer, mapView: MapView, completeDrawingCallbackHandler: DrawingCallbackHandler['complete']) {
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

  public cancel(): void {
    this.sketchViewModel.cancel();
  }

  public abstract start(): void;
}
