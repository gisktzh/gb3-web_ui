import {EsriCollection} from '../../map/services/esri-services/esri.module';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Layer = __esri.Layer;
import Map = __esri.Map;

export class EsriMapMock implements Partial<Map> {
  public readonly layers: __esri.Collection<Layer> = new EsriCollection();

  constructor(fixedLayers: GraphicsLayer[]) {
    fixedLayers.forEach((fixedLayer) => this.add(fixedLayer));
  }

  public add(layer: Layer, index?: number) {
    this.layers.add(layer, index);
  }

  public remove(layer: Layer): Layer {
    this.layers.remove(layer);
    return layer;
  }

  public removeMany(layers: Layer[]): Layer[] {
    layers.forEach((layer) => {
      this.layers.remove(layer);
    });
    return layers;
  }

  public removeAll(): Layer[] {
    const removedLayers = [...this.layers];
    this.layers.removeAll();
    return removedLayers;
  }

  public reorder(layer: Layer, index: number): Layer {
    this.layers.reorder(layer, index);
    return layer;
  }
}
