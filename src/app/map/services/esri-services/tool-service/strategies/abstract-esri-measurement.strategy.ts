import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Polygon from '@arcgis/core/geometry/Polygon';
import Graphic from '@arcgis/core/Graphic';
import Polyline from '@arcgis/core/geometry/Polyline';
import Point from '@arcgis/core/geometry/Point';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import {AbstractEsriDrawableToolStrategy} from './abstract-esri-drawable-tool.strategy';
import {DrawingCallbackHandler} from '../interfaces/drawing-callback-handler.interface';
import {UserDrawingLayer} from '../../../../../shared/enums/drawing-layer.enum';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {HANDLE_GROUP_KEY} from '../esri-tool.service';

export type LabelConfiguration = {location: Point; symbolization: TextSymbol};

export abstract class AbstractEsriMeasurementStrategy<
  TGeometry extends Polygon | Polyline | Point,
  TDrawingCallbackHandler extends DrawingCallbackHandler['completeMeasurement'],
> extends AbstractEsriDrawableToolStrategy<TDrawingCallbackHandler> {
  public readonly internalLayerType: UserDrawingLayer = UserDrawingLayer.Measurements;

  protected constructor(layer: GraphicsLayer, mapView: MapView, completeDrawingCallbackHandler: TDrawingCallbackHandler) {
    super(layer, mapView, completeDrawingCallbackHandler);
    this.sketchViewModel.tooltipOptions.enabled = true;
    this.sketchViewModel.tooltipOptions.visibleElements.helpMessage = true;
    this.sketchViewModel.tooltipOptions.helpMessage = 'Klicke auf die Karte um zu beginnen. Drücke "Tab" um Werte einzugeben';
  }

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});

    reactiveUtils.on(
      () => this.sketchViewModel,
      'create',
      ({state, graphic}) => {
        let labelConfiguration: {label: Graphic; labelText: string};
        let graphicIdentifier: string;
        switch (state) {
          case 'active':
          case 'start':
          case 'cancel':
            break; // currently, these events do not trigger any action
          case 'complete':
            graphicIdentifier = this.setAndGetIdentifierOnGraphic(graphic);
            labelConfiguration = this.createLabelForGeometry(graphic.geometry as TGeometry, graphicIdentifier);
            this.layer.add(labelConfiguration.label);
            this.completeDrawingCallbackHandler(graphic, labelConfiguration.label, labelConfiguration.labelText);
            break;
        }
      },
    );
  }

  public edit(graphic: __esri.Graphic) {
    void this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});

    const editHandle = reactiveUtils.on(
      () => this.sketchViewModel,
      'update',
      ({state}) => {
        let labelConfiguration: {label: Graphic; labelText: string};
        let graphicIdentifier: string;

        switch (state) {
          case 'start':
            this.removeLabelOnEditAndDelete(graphic);
            break;
          case 'active':
            break;
          case 'complete':
            if (graphic.getAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName)) {
              break;
            }
            graphicIdentifier = graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName);
            if (
              this.layer.graphics.find((g) => g.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName) === graphicIdentifier)
            ) {
              labelConfiguration = this.createLabelForGeometry(graphic.geometry as TGeometry, graphicIdentifier);
              this.layer.add(labelConfiguration.label);
              this.completeDrawingCallbackHandler(graphic, labelConfiguration.label, labelConfiguration.labelText);
            }
            break;
        }
      },
    );
    this.sketchViewModel.view.addHandles([editHandle], HANDLE_GROUP_KEY);
  }

  /**
   * Creates a label for a given geometry and returns the location and the symbolization as a TextSymbol. The labeltext ist container
   * within the symbolization.
   * @param geometry
   * @protected
   */
  protected abstract createLabelConfigurationForGeometry(geometry: TGeometry): LabelConfiguration;

  private removeLabelOnEditAndDelete(graphic: Graphic) {
    const labelGraphic: Graphic = this.layer.graphics.find(
      (g) =>
        g.getAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName) ===
        graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName),
    );
    this.layer.remove(labelGraphic);
  }

  private createLabelForGeometry(geometry: TGeometry, belongsToGraphic: string): {label: Graphic; labelText: string} {
    const {location, symbolization} = this.createLabelConfigurationForGeometry(geometry);
    const label = new Graphic({
      geometry: location,
      symbol: symbolization,
    });

    this.setIdentifierOnGraphic(label);
    this.setLabelTextAttributeOnGraphic(label, symbolization.text);
    this.setBelongsToAttributeOnGraphic(label, belongsToGraphic);

    return {label, labelText: symbolization.text};
  }
}
