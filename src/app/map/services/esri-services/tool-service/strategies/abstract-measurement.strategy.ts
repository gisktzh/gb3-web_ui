import {EsriToolStrategy} from '../interfaces/strategy.interface';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

export abstract class AbstractMeasurementStrategy implements EsriToolStrategy {
  protected readonly sketchViewModel: SketchViewModel;
  protected readonly layer: GraphicsLayer;

  constructor(layer: GraphicsLayer, mapView: MapView) {
    // todo: check whether new SketchViewModels are okay; otherwise -> singleton and reuse the model.
    this.sketchViewModel = new SketchViewModel({
      view: mapView,
      layer: layer,
      tooltipOptions: {enabled: true},
      polylineSymbol: {
        type: 'simple-line',
        color: '#FF0000',
        width: 2
      },
      updateOnGraphicClick: false
    });

    this.layer = layer;
  }

  public abstract end(): void;

  public abstract start(): void;
}
