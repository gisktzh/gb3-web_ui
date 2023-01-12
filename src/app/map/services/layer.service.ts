import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {EsriMapService} from './esri-map.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private readonly activeLayers$: BehaviorSubject<Array<__esri.Layer>> = new BehaviorSubject<Array<__esri.Layer>>([]);

  constructor(private readonly mapService: EsriMapService) {
    this.initLayers();
    this.activeLayers.subscribe((layers) => {
      this.mapService.mapView.map.layers.removeAll();
      this.mapService.mapView.map.layers.addMany(layers);
    });
  }

  public get activeLayers(): Observable<Array<__esri.Layer>> {
    return this.activeLayers$.asObservable();
  }

  public get currentActiveLayers(): __esri.Layer[] {
    return this.activeLayers$.value;
  }

  private initLayers(): void {
    this.activeLayers$.next([]);
  }
}
