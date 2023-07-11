import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {AbstractEsriDrawableToolStrategy} from '../abstract-esri-drawable-tool.strategy';

export abstract class AbstractEsriDrawingStrategy extends AbstractEsriDrawableToolStrategy {
  protected constructor(layer: GraphicsLayer, mapView: MapView, callbackHandler: () => void) {
    super(layer, mapView, callbackHandler);
  }

  public start(): void {
    this.sketchViewModel.create(this.tool, {mode: 'click'});
    this.sketchViewModel.on('create', (event) => {
      switch (event.state) {
        case 'active':
        case 'start':
          break; // currently, these events do not trigger any action
        case 'complete':
          this.callbackHandler();
          break;
        case 'cancel':
          this.callbackHandler();
          break;
      }
    });
  }
}
