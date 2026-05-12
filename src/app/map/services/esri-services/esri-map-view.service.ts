import {Injectable, signal} from '@angular/core';
import {MapViewWithMap} from './types/esri-mapview-with-map.type';
import Layer from '@arcgis/core/layers/Layer';
import {MapViewNotInitialized} from './errors/esri.errors';

@Injectable({providedIn: 'root'})
export class EsriMapViewService {
  public mapView = signal<MapViewWithMap | undefined>(undefined);

  public findEsriLayer(id: string): Layer | undefined {
    const mapView = this.mapView();
    if (!mapView) {
      return undefined;
    }

    return mapView.map.layers.find((layer) => layer.id === id);
  }

  public getMapView() {
    const mapView = this.mapView();

    if (!mapView) {
      throw new MapViewNotInitialized();
    }

    return mapView;
  }
}
