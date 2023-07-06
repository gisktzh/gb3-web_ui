import {EsriToolStrategy} from '../interfaces/strategy.interface';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {EsriSketchTool} from '../../esri.module';

export type SupportedEsriTool = Extract<EsriSketchTool, 'polygon' | 'polyline' | 'point'>;
export type LabelConfiguration = {location: Point; symbolization: TextSymbol};

export abstract class AbstractEsriMeasurementStrategy<T extends Polygon | Polyline | Point> implements EsriToolStrategy {
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

  public end(): void {
    // todo: add logic for disabling the tool (if needed)
    console.log('ending');
  }

  public start(): void {
    this.sketchViewModel.create(this.tool);
    this.sketchViewModel.on('create', (event) => {
      if (event.state === 'complete') {
        const geometry: T = event.graphic.geometry as T;
        const {location, symbolization} = this.createLabelForGeometry(geometry);
        const label = new Graphic({
          geometry: location,
          symbol: symbolization
        });
        this.layer.addMany([label]);

        this.callbackHandler();
      }
    });
  }

  /**
   * Creates a label for a given geometry and returns the location and the symbolization as a TextSymbol. The labeltext ist container
   * within the symbolization.
   * @param geometry
   * @protected
   */
  protected abstract createLabelForGeometry(geometry: T): LabelConfiguration;
}
