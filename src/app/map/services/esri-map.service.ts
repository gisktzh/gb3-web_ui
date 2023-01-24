import {Injectable} from '@angular/core';
import {EsriMap, EsriMapView, EsriPoint, EsriWMSLayer} from '../../shared/external/esri.module';
import {Store} from '@ngrx/store';
import {MapConfigurationActions} from '../../core/state/map/actions/map-configuration.actions';
import {TransformationService} from './transformation.service';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {
  MapConfigurationState,
  selectActiveBasemapId,
  selectMapConfigurationState
} from '../../core/state/map/reducers/map-configuration.reducer';
import {first, skip, Subscription, tap} from 'rxjs';
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
import {LoadingState} from '../../shared/types/loading-state';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {defaultMapConfig} from '../../shared/configs/map-config';
import {ZoomType} from '../../shared/types/zoom-type';
import Basemap from '@arcgis/core/Basemap';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import ViewClickEvent = __esri.ViewClickEvent;
import ViewLayerviewCreateEvent = __esri.ViewLayerviewCreateEvent;
import {BasemapConfigurationService} from '../../shared/services/basemap-configuration.service';

@Injectable({
  providedIn: 'root'
})
export class EsriMapService implements MapService {
  private effectiveMaxZoom = 23;
  private effectiveMinZoom = 0;
  private effectiveMinScale = 0;

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
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);

  constructor(
    private readonly store: Store,
    private readonly transformationService: TransformationService,
    private readonly geoJSONMapperService: GeoJSONMapperService,
    private readonly basemapConfigurationService: BasemapConfigurationService
  ) {}

  private get mapView(): __esri.MapView {
    return this._mapView;
  }

  public setScale(scale: number) {
    this.mapView.scale = scale;
  }

  public handleZoom(zoomType: ZoomType) {
    const currentZoom = Math.floor(this.mapView.zoom);
    switch (zoomType) {
      case 'zoomIn': {
        const zoomTo = currentZoom + 1;
        if (zoomTo <= this.effectiveMaxZoom) {
          this.mapView.zoom = zoomTo;
        }
        break;
      }
      case 'zoomOut': {
        const zoomTo = currentZoom - 1;
        const currentScale = this.mapView.scale;
        // also check for currentscale, because we might be at the lowest zoomlevel, but not yet at the lowest scale
        if (zoomTo >= this.effectiveMinZoom || currentScale <= this.effectiveMinScale) {
          this.mapView.zoom = zoomTo;
        }
      }
    }
  }

  public init(): void {
    this.store
      .select(selectMapConfigurationState)
      .pipe(
        first(),
        tap((config: MapConfigurationState) => {
          const {x, y} = config.center;
          const {minScale, maxScale} = config.scaleSettings;
          const {scale, srsId, activeBasemapId} = config;
          const map = this.createMap(activeBasemapId);
          this.setMapView(map, scale, x, y, srsId, minScale, maxScale);
          this.attachMapViewListeners();
          this.addBasemapSubscription();
          this.addScaleBar();
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

  public resetExtent() {
    const {
      center: {x, y},
      srsId,
      scale
    } = defaultMapConfig;
    this.mapView.center = new EsriPoint({x: x, y: y, spatialReference: new SpatialReference({wkid: srsId})});
    this.mapView.scale = scale;
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

  private addBasemapSubscription() {
    this.subscriptions.add(
      this.activeBasemapId$
        .pipe(
          skip(1), // Skip first, because the first is set by init()
          tap((activeBasemapId) => {
            this.switchBasemap(activeBasemapId);
          })
        )
        .subscribe()
    );
  }

  private addScaleBar() {
    const scaleBar = new ScaleBar({view: this.mapView, container: 'scale-bar-container', unit: 'metric'});
    this.mapView.ui.add(scaleBar);
  }

  private createMap(initialBasemapId: string): __esri.Map {
    return new EsriMap({
      basemap: new Basemap({
        baseLayers: this.basemapConfigurationService.availableBasemaps.map((baseMap) => {
          return new WMSLayer({
            id: baseMap.id,
            url: baseMap.url,
            title: baseMap.title,
            spatialReference: new SpatialReference({wkid: baseMap.srsId}),
            sublayers: baseMap.layers.map((basemapLayer) => ({name: basemapLayer.name})),
            visible: initialBasemapId === baseMap.id
          });
        })
      })
    });
  }

  private setMapView(map: __esri.Map, scale: number, x: number, y: number, srsId: number, minScale: number, maxScale: number) {
    const spatialReference = new SpatialReference({wkid: srsId});
    this._mapView = new EsriMapView({
      map: map,
      scale: scale,
      center: new EsriPoint({x, y, spatialReference}),
      constraints: {
        snapToZoom: false,
        minScale: minScale,
        maxScale: maxScale,
        lods: TileInfo.create({
          spatialReference
        }).lods
      }
    });
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

    reactiveUtils
      .whenOnce(() => this.mapView.ready)
      .then(() => {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */ // at this point, we know the values are ready
        const {effectiveMaxScale, effectiveMinScale, effectiveMaxZoom, effectiveMinZoom} = this.mapView.constraints;

        this.effectiveMaxZoom = effectiveMaxZoom!;
        this.effectiveMinZoom = effectiveMinZoom!;
        this.effectiveMinScale = effectiveMinScale!;

        this.store.dispatch(
          MapConfigurationActions.setReady({
            calculatedMinScale: effectiveMinScale!,
            calculatedMaxScale: effectiveMaxScale!
          })
        );
      });

    reactiveUtils.on(
      () => this.mapView,
      'layerview-create',
      (event: ViewLayerviewCreateEvent) => {
        this.attachLayerViewListeners(event.layerView);
      }
    );
  }

  private attachLayerListeners(esriLayer: __esri.Layer) {
    reactiveUtils.watch(
      () => esriLayer.loadStatus,
      (loadStatus) => {
        const loadingState = this.transformLoadStatusToLoadingState(loadStatus);
        this.store.dispatch(ActiveMapItemActions.setLoadingState({loadingState, id: esriLayer.id}));
      }
    );
  }

  private attachLayerViewListeners(esriLayerView: __esri.LayerView) {
    reactiveUtils.watch(
      () => esriLayerView.updating,
      (updating) => {
        if (esriLayerView.layer) {
          const viewProcessState: ViewProcessState = updating ? 'updating' : 'completed';
          this.store.dispatch(ActiveMapItemActions.setViewProcessState({viewProcessState: viewProcessState, id: esriLayerView.layer.id}));
        }
      }
    );
  }

  private transformLoadStatusToLoadingState(loadStatus: 'not-loaded' | 'loading' | 'failed' | 'loaded' | undefined): LoadingState {
    if (!loadStatus) {
      return 'undefined';
    }
    switch (loadStatus) {
      case 'not-loaded':
        return 'undefined';
      case 'failed':
        return 'error';
      case 'loading':
        return 'loading';
      case 'loaded':
        return 'loaded';
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

  private switchBasemap(basemapId: string) {
    this.mapView.map.basemap.baseLayers.map((baseLayer) => {
      baseLayer.visible = basemapId === baseLayer.id;
    });
  }
}
