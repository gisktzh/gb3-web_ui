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
      ({state, graphic}: {state: __esri.SketchViewModelCreateEvent['state']; graphic: Graphic}) => {
        switch (state) {
          case 'active':
          case 'start':
          case 'cancel':
            break; // currently, these events do not trigger any action
          case 'complete': {
            const graphicIdentifier = this.setAndGetIdentifierOnGraphic(graphic);
            const labelConfiguration: {label: Graphic; labelText: string} = this.createLabelForGeometry(
              graphic.geometry as TGeometry,
              graphicIdentifier,
            );
            this.layer.add(labelConfiguration.label);
            this.completeDrawingCallbackHandler(graphic, labelConfiguration.label, labelConfiguration.labelText, 'add');
            break;
          }
        }
      },
    );
  }

  public edit(graphic: __esri.Graphic) {
    void this.sketchViewModel.update(graphic, {multipleSelectionEnabled: false});

    reactiveUtils.on(
      () => this.sketchViewModel,
      'update',
      ({state}: {state: __esri.SketchViewModelUpdateEvent['state']}) => {
        switch (state) {
          case 'start':
            this.removeLabelOnEdit(graphic);
            break;
          case 'active':
            break;
          case 'complete':
            this.completeEditing(graphic);
            break;
        }
      },
    );
  }

  /**
   * Creates a label for a given geometry and returns the location and the symbolization as a TextSymbol. The labeltext ist container
   * within the symbolization.
   * @param geometry
   * @protected
   */
  protected abstract createLabelConfigurationForGeometry(geometry: TGeometry): LabelConfiguration;

  private completeEditing(graphic: Graphic) {
    const graphicIdentifier = graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName);
    // checks if the graphic still exists in the layer, i. e if it was not deleted during edit
    const graphicExistsOnLayer = this.checkIfGraphicExistsOnLayer(graphicIdentifier);
    if (!graphicExistsOnLayer) {
      // When deleting, all we care about is the "__id"-attribute of the graphic. This is why we are calling the method with "dummy"-values like the second graphic and an empty string. We only need the identifier and the delete-mode
      this.completeDrawingCallbackHandler(graphic, graphic, '', 'delete');
      return;
    }

    // If we are editing a label, we need to find the graphic that the label belongs to and update both
    const belongsToIdentifier = graphic.getAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName);
    if (belongsToIdentifier) {
      const belongsToGraphic = this.layer.graphics.find(
        (existingGraphic) => existingGraphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName) === belongsToIdentifier,
      );
      if (belongsToGraphic) {
        this.completeDrawingCallbackHandler(belongsToGraphic, graphic, (graphic.symbol as TextSymbol).text, 'edit');
      }
      return;
    }

    const labelConfiguration = this.createLabelForGeometry(graphic.geometry as TGeometry, graphicIdentifier);
    this.layer.add(labelConfiguration.label);
    this.completeDrawingCallbackHandler(graphic, labelConfiguration.label, labelConfiguration.labelText, 'edit');
  }

  private removeLabelOnEdit(graphic: Graphic) {
    const labelGraphic = this.layer.graphics.find(
      (existingGraphic) =>
        existingGraphic.getAttribute(AbstractEsriDrawableToolStrategy.belongsToFieldName) ===
        graphic.getAttribute(AbstractEsriDrawableToolStrategy.identifierFieldName),
    );
    if (labelGraphic) {
      this.layer.remove(labelGraphic);
    }
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
