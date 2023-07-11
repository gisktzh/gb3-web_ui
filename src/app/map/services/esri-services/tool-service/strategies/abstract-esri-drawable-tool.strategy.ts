import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {EsriSketchTool} from '../../esri.module';
import {EsriToolStrategy} from '../interfaces/strategy.interface';

export type SupportedEsriTool = Extract<EsriSketchTool, 'polygon' | 'polyline' | 'point'>;

export abstract class AbstractEsriDrawableToolStrategy implements EsriToolStrategy {
  protected readonly sketchViewModel: SketchViewModel;
  protected readonly layer: GraphicsLayer;
  protected readonly callbackHandler: () => void;
  protected abstract readonly tool: SupportedEsriTool;

  protected constructor(layer: GraphicsLayer, mapView: MapView, callbackHandler: () => void) {
    // todo: check whether new SketchViewModels are okay; otherwise -> singleton and reuse the model.
    this.sketchViewModel = new SketchViewModel({
      view: mapView,
      layer: layer,
      tooltipOptions: {enabled: false}, // todo: check how we can fix the display; seems not implemented:
      // https://community.esri.com/t5/arcgis-javascript-maps-sdk-questions/how-to-show-cursor-tooltips-when-a-sketch-tool-is/td-p/1276503
      updateOnGraphicClick: false
    });

    this.layer = layer;
    this.callbackHandler = callbackHandler;
  }

  public cancel(): void {
    this.sketchViewModel.cancel();
  }

  public abstract start(): void;
}
