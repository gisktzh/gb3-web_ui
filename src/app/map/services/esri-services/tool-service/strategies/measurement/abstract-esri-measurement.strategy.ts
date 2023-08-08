import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../../interfaces/drawing-callback-handler.interface';

export type LabelConfiguration = {location: Point; symbolization: TextSymbol};

export abstract class AbstractEsriMeasurementStrategy<T extends Polygon | Polyline | Point> extends AbstractEsriDrawableToolStrategy {
  protected constructor(layer: GraphicsLayer, mapView: MapView, completeDrawingCallbackHandler: DrawingCallbackHandler['complete']) {
    super(layer, mapView, completeDrawingCallbackHandler);
  }

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});
    this.sketchViewModel.on('create', ({state, graphic}) => {
      let label: Graphic;
      let graphicIdentifier: string;
      switch (state) {
        case 'active':
        case 'start':
        case 'cancel':
          break; // currently, these events do not trigger any action
        case 'complete':
          graphicIdentifier = this.setAndGetIdentifierOnGraphic(graphic);
          label = this.createLabelForGeometry(graphic.geometry as T, graphicIdentifier);
          this.layer.add(label);
          this.completeDrawingCallbackHandler(graphic); // todo: add label graphic
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
  protected abstract createLabelConfigurationForGeometry(geometry: T): LabelConfiguration;

  private createLabelForGeometry(geometry: T, graphicIdentifier: string): Graphic {
    const {location, symbolization} = this.createLabelConfigurationForGeometry(geometry);
    const label = new Graphic({
      geometry: location,
      symbol: symbolization,
    });

    this.setIdentifierOnGraphic(label, graphicIdentifier);
    this.setLabelTextAttributeOnGraphic(label, symbolization.text);

    return label;
  }
}
