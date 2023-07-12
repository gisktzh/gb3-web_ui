import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';

export abstract class AbstractEsriDrawingStrategy extends AbstractEsriDrawableToolStrategy {
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
          this.completeCallbackHandler();
          break;
      }
    });
  }
}
