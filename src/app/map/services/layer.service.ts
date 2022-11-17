import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {LayersConfig} from '../../../assets/layers.config';
import {EsriGroupLayer, EsriWMSLayer} from '../../shared/external/esri.module';
import {MapService} from './map.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private readonly activeLayers$: BehaviorSubject<Array<__esri.Layer>> = new BehaviorSubject<Array<__esri.Layer>>([]);

  public get activeLayers(): Observable<Array<__esri.Layer>> {
    return this.activeLayers$.asObservable();
  }

  public get currentActiveLayers(): __esri.Layer[] {
    return this.activeLayers$.value;
  }

  constructor(private readonly mapService: MapService) {
    this.initLayers();
    this.activeLayers.subscribe((layers) => {
      this.mapService.mapView.map.layers.removeAll();
      this.mapService.mapView.map.layers.addMany(layers);
    });
  }

  private initLayers(): void {
    const groupLayers: __esri.GroupLayer[] = [];
    LayersConfig.forEach((layerConfig) => {
      const uniqueLayers: __esri.Layer[] = [];
      layerConfig.layer.split(',').map((sublayer) => {
        const layer = new EsriWMSLayer({
          id: layerConfig.id,
          url: layerConfig.url,
          sublayers: [{name: sublayer, title: sublayer}],
          description: layerConfig.queryLayerName
        });
        uniqueLayers.push(layer);
      });
      groupLayers.push(new EsriGroupLayer({layers: uniqueLayers, id: layerConfig.name, title: layerConfig.queryLayerName}));
    });
    this.activeLayers$.next(groupLayers);
  }
}
