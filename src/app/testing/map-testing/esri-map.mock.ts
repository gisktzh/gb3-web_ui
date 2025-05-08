import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Collection from '@arcgis/core/core/Collection';
import EsriMap from '@arcgis/core/Map';
import Layer from '@arcgis/core/layers/Layer';

export class EsriMapMock implements Partial<EsriMap> {
  public readonly layers: __esri.Collection<Layer> = new Collection();

  constructor(fixedLayers: GraphicsLayer[]) {
    fixedLayers.forEach((fixedLayer) => this.add(fixedLayer));
  }

  public add(layer: Layer, index?: number) {
    this.layers.add(layer, index);
  }

  public addMany(layers: Layer[]) {
    this.layers.addMany(layers);
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
