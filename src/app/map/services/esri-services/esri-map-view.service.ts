import {Injectable} from '@angular/core';
import {MapViewNotInitialized} from './errors/esri.errors';
import {MapViewWithMap} from './types/esri-mapview-with-map.type';

function isMapViewWithMap(view: __esri.MapView | undefined): view is MapViewWithMap {
  return !!view && !!view.map;
}

@Injectable({providedIn: 'root'})
export class EsriMapViewService {
  private _mapView: __esri.MapView | undefined;

  /**
   * @throws MapViewNotInitialized
   */
  public get mapView(): MapViewWithMap {
    if (!isMapViewWithMap(this._mapView)) {
      throw new MapViewNotInitialized();
    }

    return this._mapView;
  }

  public set mapView(value: __esri.MapView) {
    this._mapView = value;
  }

  public findEsriLayer(id: string): __esri.Layer | undefined {
    return this.mapView.map.layers.find((layer) => layer.id === id);
  }
}
