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
import Graphic from '@arcgis/core/Graphic';
import {Geometry as GeoJsonGeometry} from 'geojson';
import Color from '@arcgis/core/Color';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {GeoJSONMapperService} from '../../shared/services/geo-json-mapper.service';
import {defaultHighlightStyles} from 'src/app/shared/configs/feature-info-config';
import {MapService} from '../interfaces/map.service';
import {Topic, TopicLayer} from '../../shared/interfaces/topic.interface';
import ViewClickEvent = __esri.ViewClickEvent;

@Injectable({
  providedIn: 'root'
})
export class EsriMapService implements MapService {
  private readonly highlightColors = {
    feature: new Color(defaultHighlightStyles.feature.color),
    outline: new Color(defaultHighlightStyles.outline.color)
  };
  private readonly highlightStyles = new Map<__esri.Geometry['type'], __esri.Symbol>([
    [
      'polyline',
      new SimpleLineSymbol({
        color: this.highlightColors.feature,
        width: defaultHighlightStyles.feature.width
      })
    ],
    ['point', new SimpleMarkerSymbol({color: this.highlightColors.feature})],
    ['multipoint', new SimpleMarkerSymbol({color: this.highlightColors.feature})],
    ['polygon', new SimpleFillSymbol({color: this.highlightColors.feature})]
  ]);

  constructor(
    private readonly store: Store,
    private readonly transformationService: TransformationService,
    private readonly geoJSONMapperService: GeoJSONMapperService
  ) {}

  private _mapView!: __esri.MapView;

  public get mapView(): __esri.MapView {
    return this._mapView;
  }

  public addTopic(topic: Topic) {
    if (this.getLayer(topic.topic)) {
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

  public addTopicLayer(topic: Topic, layer: TopicLayer) {
    if (this.getLayer(layer.layer)) {
      return;
    }

    const esriLayer: __esri.Layer = new EsriWMSLayer({
      id: layer.layer,
      title: layer.title,
      url: topic.wmsUrl,
      sublayers: [
        {
          id: layer.id,
          name: layer.layer,
          title: layer.title
        } as __esri.WMSSublayerProperties
      ]
    });
    this.mapView.map.layers.add(esriLayer);
  }

  public removeTopic(topic: Topic) {
    const esriLayer = this.getLayer(topic.topic);
    if (esriLayer) {
      this.mapView.map.layers.remove(esriLayer);
    }
  }

  public removeTopicLayer(topic: Topic, layer: TopicLayer) {
    const esriLayer = this.getLayer(layer.layer);
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

  public assignMapElement(container: HTMLDivElement) {
    this.mapView.container = container;
  }

  public addHighlightGeometry(geometry: GeoJsonGeometry): void {
    const esriGeometry = this.geoJSONMapperService.fromGeoJSONToEsri(geometry);
    const symbolization = this.highlightStyles.get(esriGeometry.type);
    const highlightedFeature = new Graphic({geometry: esriGeometry, symbol: symbolization});

    this.mapView.graphics.add(highlightedFeature);
  }

  public removeAllHighlightGeometries(): void {
    this.mapView.graphics.removeAll();
  }

  private getLayer(id: string): __esri.Layer {
    return this.mapView.map.layers.find((layer) => layer.id === id);
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

    reactiveUtils.whenOnce(() => this.mapView.ready).then(() => this.store.dispatch(MapConfigurationActions.setReady()));
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
