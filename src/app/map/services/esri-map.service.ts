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
import {ActiveMapItem} from '../models/active-map-item.model';
import {ActiveMapItemActions} from '../../core/state/map/actions/active-map-item.actions';
import {LoadingState} from '../../shared/enums/loading-state';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import ViewClickEvent = __esri.ViewClickEvent;

@Injectable({
  providedIn: 'root'
})
export class EsriMapService implements MapService {
  // TODO this should be moved to a config file
  private readonly highlightColors = {
    feature: new Color(defaultHighlightStyles.feature.color),
    outline: new Color(defaultHighlightStyles.outline.color)
  };
  // TODO this should be moved to a config file
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

  private _mapView!: __esri.MapView;

  constructor(
    private readonly store: Store,
    private readonly transformationService: TransformationService,
    private readonly geoJSONMapperService: GeoJSONMapperService
  ) {}

  private get mapView(): __esri.MapView {
    return this._mapView;
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
          this.attachMapViewListeners();
        })
      )
      .subscribe();
  }

  public addMapItem(mapItem: ActiveMapItem) {
    if (this.findEsriLayer(mapItem.id)) {
      return;
    }

    const esriLayer: __esri.Layer = new EsriWMSLayer({
      id: mapItem.id,
      title: mapItem.title,
      url: mapItem.url,
      sublayers: mapItem.layers.map((layer) => {
        return {
          id: layer.id,
          name: layer.layer,
          title: layer.title
        } as __esri.WMSSublayerProperties;
      })
    });
    this.attachLayerListeners(esriLayer);
    this.mapView.map.layers.add(esriLayer, 0);
  }

  public removeMapItem(id: string) {
    const esriLayer = this.findEsriLayer(id);
    if (esriLayer) {
      this.mapView.map.layers.remove(esriLayer);
    }
  }

  public removeAllMapItems() {
    this.mapView.map.layers.removeAll();
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

  public setOpacity(opacity: number, mapItem: ActiveMapItem): void {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer) {
      esriLayer.opacity = opacity;
    }
  }

  public setVisibility(visible: boolean, mapItem: ActiveMapItem): void {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer) {
      esriLayer.visible = visible;
    }
  }

  public setSublayerVisibility(visible: boolean, mapItem: ActiveMapItem, layerId: number) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof WMSLayer) {
      const esriSubLayer = esriLayer.sublayers.find((sl) => sl.id === layerId);
      if (esriSubLayer) {
        esriSubLayer.visible = visible;
      }
    }
  }

  public reorderMapItem(previousIndex: number, currentIndex: number) {
    // use the reverse indices so that the item with the lowest index has the highest visibility (it's on top) and vice versa
    const reversePreviousIndex = this.mapView.layerViews.length - 1 - previousIndex;
    const reverseCurrentIndex = this.mapView.layerViews.length - 1 - currentIndex;
    this.mapView.layerViews.reorder(this.mapView.layerViews.getItemAt(reversePreviousIndex), reverseCurrentIndex);
  }

  public reorderSublayer(mapItem: ActiveMapItem, previousIndex: number, currentIndex: number) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof WMSLayer) {
      esriLayer.sublayers.reorder(esriLayer.sublayers.getItemAt(previousIndex), currentIndex);
    }
  }

  private findEsriLayer(id: string): __esri.Layer {
    return this.mapView.map.layers.find((layer) => layer.id === id);
  }

  private attachMapViewListeners() {
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

  private attachLayerListeners(esriLayer: __esri.Layer) {
    reactiveUtils.when(
      () => esriLayer.loadStatus,
      (loadStatus) => {
        const loadingState = this.transformLoadStatusToLoadingState(loadStatus);
        this.store.dispatch(ActiveMapItemActions.setLoadingState({loadingState, id: esriLayer.id}));
      }
    );
  }

  private transformLoadStatusToLoadingState(loadStatus: 'not-loaded' | 'loading' | 'failed' | 'loaded' | undefined): LoadingState {
    if (!loadStatus) {
      return LoadingState.UNDEFINED;
    }
    switch (loadStatus) {
      case 'not-loaded':
        return LoadingState.UNDEFINED;
      case 'loading':
        return LoadingState.LOADING;
      case 'failed':
        return LoadingState.UNDEFINED;
      case 'loaded':
        return LoadingState.LOADED;
    }
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
