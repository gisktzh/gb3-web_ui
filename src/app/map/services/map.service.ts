import {Injectable} from '@angular/core';
import {EsriGroupLayer, EsriMap, EsriMapView, EsriPoint, EsriWMSLayer} from '../../shared/external/esri.module';
import {LayersConfig} from '../../../assets/layers.config';
import {Store} from '@ngrx/store';
import {MapConfigurationActions} from '../../core/state/map/actions/map-configuration.actions';
import {TransformationService} from './transformation.service';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {MapConfigurationState, selectMapConfigurationState} from '../../core/state/map/reducers/map-configuration.reducer';
import {first, Subscription, tap} from 'rxjs';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {FeatureInfoActions} from '../../core/state/map/actions/feature-info.actions';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import {defaultHighlightStyles} from '../../shared/configs/feature-info-config';
import Color from '@arcgis/core/Color';
import {Symbol as EsriSymbol} from '@arcgis/core/symbols';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {Geometry as EsriGeometry} from '@arcgis/core/geometry';
import {Geometry as GeoJSONGeometry} from 'geojson';
import {selectHighlightedFeature} from '../../core/state/map/reducers/feature-info.reducer';
import {GeoJSONMapperServiceService} from '../../shared/services/geo-json-mapper-service.service';
import Graphic from '@arcgis/core/Graphic';
import ViewClickEvent = __esri.ViewClickEvent;

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly defaultHighlightColors = {
    feature: new Color(defaultHighlightStyles.feature.color),
    outline: new Color(defaultHighlightStyles.outline.color)
  };
  private readonly defaultHighlightStyles = new Map<EsriGeometry['type'], EsriSymbol>([
    [
      'polyline',
      new SimpleLineSymbol({
        color: this.defaultHighlightColors.feature,
        width: defaultHighlightStyles.feature.width
      })
    ],
    ['point', new SimpleMarkerSymbol({color: this.defaultHighlightColors.feature})],
    ['multipoint', new SimpleMarkerSymbol({color: this.defaultHighlightColors.feature})],
    ['polygon', new SimpleFillSymbol({color: this.defaultHighlightColors.feature})]
  ]);
  private readonly highlightedFeature$ = this.store.select(selectHighlightedFeature);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly transformationService: TransformationService,
    private readonly geoJSONMapperService: GeoJSONMapperServiceService
  ) {}

  private _mapView!: __esri.MapView;

  public get mapView(): __esri.MapView {
    return this._mapView;
  }

  public init(): void {
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
      groupLayers.push(
        new EsriGroupLayer({
          layers: uniqueLayers,
          id: layerConfig.name,
          title: layerConfig.queryLayerName
        })
      );
    });

    const map = new EsriMap({basemap: 'hybrid', layers: groupLayers});

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
          this.initSubscriptions();
        })
      )
      .subscribe();
  }

  public assignMapElement(container: any) {
    this.mapView.container = container;
  }

  private highlightFeature(feature: GeoJSONGeometry) {
    this.removeHighlightedFeature(); // make sure we have a clean slate

    const geometry = this.geoJSONMapperService.fromGeoJSONToEsri(feature);
    const symbol = this.defaultHighlightStyles.get(geometry.type);
    const highlightedFeature = new Graphic({geometry: geometry, symbol});

    this.mapView.graphics.add(highlightedFeature);
  }

  private removeHighlightedFeature() {
    this.mapView.graphics.removeAll();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.highlightedFeature$
        .pipe(tap((feature) => (feature ? this.highlightFeature(feature) : this.removeHighlightedFeature())))
        .subscribe()
    );
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
