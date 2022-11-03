import {Injectable, NgZone} from '@angular/core';
import {EsriMap, EsriMapView} from '../../shared/external/esri.module';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(private readonly zone: NgZone) {}

  private _mapView!: __esri.MapView;

  get mapView(): __esri.MapView {
    return this._mapView;
  }

  public init(): void {
    this.zone.runOutsideAngular(() => {
      const map = new EsriMap({basemap: 'hybrid'});
      this._mapView = new EsriMapView({
        map: map,
        scale: 50000,
        center: {
          type: 'point',
          x: 2682260.0,
          y: 1248390.0,
          spatialReference: {
            wkid: 2056
          }
        }
      });
    });
  }

  assignMapElement(container: any) {
    this.zone.runOutsideAngular(() => {
      this._mapView.container = container;
    });
  }
}
