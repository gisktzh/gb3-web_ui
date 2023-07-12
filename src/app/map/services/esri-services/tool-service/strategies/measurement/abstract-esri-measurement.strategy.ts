import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';

export type LabelConfiguration = {location: Point; symbolization: TextSymbol};

export abstract class AbstractEsriMeasurementStrategy<T extends Polygon | Polyline | Point> extends AbstractEsriDrawableToolStrategy {
  protected constructor(layer: GraphicsLayer, mapView: MapView, completeCallbackHandler: () => void) {
    super(layer, mapView, completeCallbackHandler);
  }

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});
    this.sketchViewModel.on('create', (event) => {
      switch (event.state) {
        case 'active':
        case 'start':
        case 'cancel':
          break; // currently, these events do not trigger any action
        case 'complete':
          this.persistSketchToLayer(event.graphic.geometry as T);
          this.completeCallbackHandler();
          break;
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

  private persistSketchToLayer(geometry: T) {
    const {location, symbolization} = this.createLabelForGeometry(geometry);
    const label = new Graphic({
      geometry: location,
      symbol: symbolization
    });
    this.layer.addMany([label]);
  }
}
