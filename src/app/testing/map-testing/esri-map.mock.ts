import {EsriCollection} from '../../map/external/esri.module';
import Layer = __esri.Layer;
import Map = __esri.Map;

export class EsriMapMock implements Partial<Map> {
  public readonly layers: __esri.Collection<Layer> = new EsriCollection();

  public add(layer: Layer, index?: number) {
    this.layers.add(layer, index);
  }

  public remove(layer: Layer): Layer {
    this.layers.remove(layer);
    return layer;
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
