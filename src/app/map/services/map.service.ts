import {Injectable} from '@angular/core';
import {EsriMap, EsriMapView, EsriPoint, EsriWMSLayer} from '../../shared/external/esri.module';
import {Store} from '@ngrx/store';
import {MapConfigurationActions} from '../../core/state/map/actions/map-configuration.actions';
import {TransformationService} from './transformation.service';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {MapConfigurationState, selectMapConfigurationState} from '../../core/state/map/reducers/map-configuration.reducer';
import {first, tap} from 'rxjs';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {FeatureInfoActions} from '../../core/state/map/actions/feature-info.actions';
import {Topic} from '../../shared/models/gb3-api.interfaces';
import ViewClickEvent = __esri.ViewClickEvent;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor(private readonly store: Store, private readonly transformationService: TransformationService) {}

  private _mapView!: __esri.MapView;

  public get mapView(): __esri.MapView {
    return this._mapView;
  }

  public getLayer(topic: Topic): __esri.Layer {
    return this.mapView.map.layers.find((layer) => layer.id === topic.topic);
  }

  public addTopic(topic: Topic) {
    if (this.getLayer(topic)) {
      return;
    }

    const esriLayer: __esri.Layer = new EsriWMSLayer({
      id: topic.topic,
      title: topic.title,
      url: topic.wmsUrl,
      sublayers: topic.layers.map((layer) => {
        return {
          id: layer.id,
          name: layer.layer,
          title: layer.title
        } as __esri.WMSSublayerProperties;
      })
    });
    this.mapView.map.layers.add(esriLayer);
  }

  public removeTopic(topic: Topic) {
    const esriLayer = this.getLayer(topic);
    if (esriLayer) {
      this.mapView.map.layers.remove(esriLayer);
    }
  }

  public removeAllTopics() {
    this.mapView.map.layers.removeAll();
  }

  public init(): void {
    const map = new EsriMap({basemap: 'hybrid'});

    this.store
      .select(selectMapConfigurationState)
      .pipe(
        first(),
        tap((config: MapConfigurationState) => {
          const {x, y} = config.center;
          const {scale, srsId} = config;
          this._mapView = new EsriMapView({
            map: map,
            scale: scale,
            center: new EsriPoint({x, y, spatialReference: new SpatialReference({wkid: srsId})})
          });
          this.attachMapListeners();
        })
      )
      .subscribe();
  }

  public assignMapElement(container: any) {
    this.mapView.container = container;
  }

  private attachMapListeners() {
    reactiveUtils.when(
      () => this.mapView.stationary,
      () => this.updateMapConfiguration()
    );

    reactiveUtils.on(
      () => this.mapView,
      'click',
      (event: ViewClickEvent) => {
        const {x, y} = this.transformationService.transform(event.mapPoint);
        this.dispatchFeatureInfoRequest(x, y);
      }
    );
  }

  private dispatchFeatureInfoRequest(x: number, y: number) {
    this.store.dispatch(FeatureInfoActions.sendRequest({x, y}));
  }

  private updateMapConfiguration() {
    const {center, scale} = this.mapView;
    const {x, y} = this.transformationService.transform(center);
    this.store.dispatch(MapConfigurationActions.setMapExtent({x, y, scale}));
  }
}
