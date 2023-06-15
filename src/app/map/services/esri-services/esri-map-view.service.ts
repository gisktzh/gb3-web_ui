import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EsriMapViewService {
  private _mapView: __esri.MapView | undefined;

  public get mapView(): __esri.MapView {
    if (!this._mapView) {
      throw new Error('MapView not initialized!');
    }

    return this._mapView;
  }

  public set mapView(value: __esri.MapView) {
    this._mapView = value;
  }
}
