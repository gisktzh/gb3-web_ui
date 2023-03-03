import {Injectable} from '@angular/core';
import {EsriLoadStatus, EsriMap, EsriMapView, EsriPoint, EsriWMSLayer} from '../../shared/external/esri.module';
import {Store} from '@ngrx/store';
import {MapConfigActions} from '../../state/map/actions/map-config.actions';
import {TransformationService} from './transformation.service';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {MapConfigState, selectActiveBasemapId, selectMapConfigState} from '../../state/map/reducers/map-config.reducer';
import {first, skip, Subscription, tap, withLatestFrom} from 'rxjs';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {FeatureInfoActions} from '../../state/map/actions/feature-info.actions';
import Graphic from '@arcgis/core/Graphic';
import {Geometry as GeoJsonGeometry} from 'geojson';
import Color from '@arcgis/core/Color';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import {GeoJSONMapperService} from '../../shared/services/geo-json-mapper.service';
import {DefaultHighlightStyles} from 'src/app/shared/configs/feature-info-config';
import {MapService} from '../interfaces/map.service';
import {ActiveMapItem} from '../models/active-map-item.model';
import {ActiveMapItemActions} from '../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../shared/types/loading-state';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import ScaleBar from '@arcgis/core/widgets/ScaleBar';
import {ViewProcessState} from '../../shared/types/view-process-state';
import {ZoomType} from '../../shared/types/zoom-type';
import Basemap from '@arcgis/core/Basemap';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import {BasemapConfigService} from './basemap-config.service';
import {ConfigService} from '../../shared/services/config.service';
import {selectActiveMapItems} from '../../state/map/reducers/active-map-item.reducer';
import {TimeSliderExtent} from '../interfaces/time-slider-extent.interface';
import {TimeSliderConfiguration, TimeSliderParameterSource} from '../../shared/interfaces/topic.interface';

@Injectable({
  providedIn: 'root'
})
export class EsriMapService implements MapService {
  private effectiveMaxZoom = 23;
  private effectiveMinZoom = 0;
  private effectiveMinScale = 0;
  private readonly defaultHighlightStyles: DefaultHighlightStyles = this.configService.featureInfoConfig.defaultHighlightStyles;
  private readonly defaultMapConfig: MapConfigState = this.configService.mapConfig.defaultMapConfig;

  // TODO this should be moved to a config file
  private readonly highlightColors = {
    feature: new Color(this.defaultHighlightStyles.feature.color),
    outline: new Color(this.defaultHighlightStyles.outline.color)
  };
  // TODO this should be moved to a config file
  private readonly highlightStyles = new Map<__esri.Geometry['type'], __esri.Symbol>([
    [
      'polyline',
      new SimpleLineSymbol({
        color: this.highlightColors.feature,
        width: this.defaultHighlightStyles.feature.width
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
    private readonly basemapConfigService: BasemapConfigService,
    private readonly configService: ConfigService
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
      .select(selectMapConfigState)
      .pipe(
        first(),
        withLatestFrom(this.store.select(selectActiveMapItems)),
        tap(([config, activeMapItems]) => {
          const {x, y} = config.center;
          const {minScale, maxScale} = config.scaleSettings;
          const {scale, srsId, activeBasemapId} = config;
          const map = this.createMap(activeBasemapId);
          this.setMapView(map, scale, x, y, srsId, minScale, maxScale);
          this.attachMapViewListeners();
          this.addBasemapSubscription();
          this.addScaleBar();
          activeMapItems.forEach((mapItem, position) => {
            this.addMapItem(mapItem, position);
          });
        })
      )
      .subscribe();
  }

  public addMapItem(mapItem: ActiveMapItem, position: number) {
    if (this.findEsriLayer(mapItem.id)) {
      return;
    }

    // TODO WES: initial time slider extent (if any)

    const esriLayer: __esri.Layer = new EsriWMSLayer({
      id: mapItem.id,
      title: mapItem.title,
      url: mapItem.url,
      visible: mapItem.visible,
      opacity: mapItem.opacity,
      sublayers: mapItem.layers.map((layer) => {
        return {
          id: layer.id,
          name: layer.layer,
          title: layer.title,
          visible: layer.visible
        } as __esri.WMSSublayerProperties;
      })
    });
    this.attachLayerListeners(esriLayer);
    // index is the inverse position - the lowest index has the lowest visibility (it's on the bottom) while the lowest position has the highest visibility
    const index = this.mapView.map.layers.length - position;
    this.mapView.map.add(esriLayer, index);
  }

  public removeMapItem(id: string) {
    const esriLayer = this.findEsriLayer(id);
    if (esriLayer) {
      this.mapView.map.remove(esriLayer);
    }
  }

  public removeAllMapItems() {
    this.mapView.map.removeAll();
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
    } = this.defaultMapConfig;
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

  public setTimeSliderExtent(timeSliderExtent: TimeSliderExtent, mapItem: ActiveMapItem) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof WMSLayer && mapItem.timeSliderConfiguration) {
      switch (mapItem.timeSliderConfiguration.sourceType) {
        case 'parameter':
          esriLayer.customLayerParameters = this.createTimeSliderCustomParameter(timeSliderExtent, mapItem.timeSliderConfiguration);
          break;
        case 'layer':
          // TODO WES: implement 'layer' source type handling
          throw new Error('not implemented yet');
      }
      esriLayer.refresh();
    }
  }

  public reorderMapItem(previousPosition: number, currentPosition: number) {
    // index is the inverse position - the lowest index has the lowest visibility (it's on the bottom) while the lowest position has the highest visibility
    const previousIndex = this.mapView.map.layers.length - 1 - previousPosition;
    const currentIndex = this.mapView.map.layers.length - 1 - currentPosition;
    this.mapView.map.layers.reorder(this.mapView.map.layers.getItemAt(previousIndex), currentIndex);
  }

  public reorderSublayer(mapItem: ActiveMapItem, previousPosition: number, currentPosition: number) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof WMSLayer) {
      // the index of sublayers is identical to their position (in contrast to the map items) where the lowest index/position has the highest visibility
      esriLayer.sublayers.reorder(esriLayer.sublayers.getItemAt(previousPosition), currentPosition);
    }
  }

  private createTimeSliderCustomParameter(
    timeSliderExtent: TimeSliderExtent,
    timeSliderConfiguration: TimeSliderConfiguration
  ): {[index: string]: string} {
    const timeSliderParameterSource = timeSliderConfiguration.source as TimeSliderParameterSource;
    const customLayerParameters: {[index: string]: string} = {};
    customLayerParameters[timeSliderParameterSource.startRangeParameter] = timeSliderExtent.startAsString;
    customLayerParameters[timeSliderParameterSource.endRangeParameter] = timeSliderExtent.endAsString;
    return customLayerParameters;
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
        baseLayers: this.basemapConfigService.availableBasemaps.map((baseMap) => {
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
      ui: {
        components: ['attribution'] // todo: may be removed, check licensing
      },
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
      () => this.updateMapConfig()
    );

    reactiveUtils.on(
      () => this.mapView,
      'click',
      (event: __esri.ViewClickEvent) => {
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
          MapConfigActions.setReady({
            calculatedMinScale: effectiveMinScale!,
            calculatedMaxScale: effectiveMaxScale!
          })
        );
      });

    reactiveUtils.on(
      () => this.mapView,
      'layerview-create',
      (event: __esri.ViewLayerviewCreateEvent) => {
        this.attachLayerViewListeners(event.layerView);
      }
    );
  }

  private attachLayerListeners(esriLayer: __esri.Layer) {
    // watch and initialize the loading state by observing the 'loadStatus' property
    reactiveUtils.watch(
      () => esriLayer.loadStatus,
      (loadStatus) => {
        this.updateLoadingState(loadStatus, esriLayer.id);
      }
    );
    this.updateLoadingState(esriLayer.loadStatus, esriLayer.id);
  }

  private attachLayerViewListeners(esriLayerView: __esri.LayerView) {
    // watch and initialize the view process state by observing the 'updating' property
    reactiveUtils.watch(
      () => esriLayerView.updating,
      (updating) => {
        this.updateViewProcessState(updating, esriLayerView.layer?.id);
      }
    );
    this.updateViewProcessState(esriLayerView.updating, esriLayerView.layer?.id);
  }

  private updateLoadingState(loadStatus: EsriLoadStatus | undefined, id: string) {
    const loadingState = this.transformLoadStatusToLoadingState(loadStatus);
    this.store.dispatch(ActiveMapItemActions.setLoadingState({loadingState: loadingState, id: id}));
  }

  private updateViewProcessState(updating: boolean | undefined, id: string | undefined) {
    if (id !== undefined) {
      const viewProcessState: ViewProcessState = this.transformUpdatingToViewProcessState(updating);
      this.store.dispatch(ActiveMapItemActions.setViewProcessState({viewProcessState: viewProcessState, id: id}));
    }
  }

  private transformLoadStatusToLoadingState(loadStatus: EsriLoadStatus | undefined): LoadingState {
    if (loadStatus === undefined) {
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

  private transformUpdatingToViewProcessState(updating: boolean | undefined): ViewProcessState {
    if (updating === undefined) {
      return 'undefined';
    }
    return updating ? 'updating' : 'completed';
  }

  private dispatchFeatureInfoRequest(x: number, y: number) {
    this.store.dispatch(FeatureInfoActions.sendRequest({x, y}));
  }

  private updateMapConfig() {
    const {center, scale} = this.mapView;
    const {x, y} = this.transformationService.transform(center);
    this.store.dispatch(MapConfigActions.setMapExtent({x, y, scale}));
  }

  private switchBasemap(basemapId: string) {
    this.mapView.map.basemap.baseLayers.map((baseLayer) => {
      baseLayer.visible = basemapId === baseLayer.id;
    });
  }
}
