import {Injectable, NgZone} from '@angular/core';
import {EsriGroupLayer, EsriMap, EsriMapView, EsriWMSLayer} from '../../shared/external/esri.module';
import {LayersConfig} from '../../../assets/layers.config';

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

      const map = new EsriMap({basemap: 'hybrid', layers: groupLayers});

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
