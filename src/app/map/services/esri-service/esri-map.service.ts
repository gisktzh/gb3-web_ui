import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapConfigActions} from '../../../state/map/actions/map-config.actions';
import {TransformationService} from '../transformation.service';
import {MapConfigState, selectActiveBasemapId, selectMapConfigState} from '../../../state/map/reducers/map-config.reducer';
import {first, skip, Subscription, tap, withLatestFrom} from 'rxjs';
import {FeatureInfoActions} from '../../../state/map/actions/feature-info.actions';
import {Geometry as GeoJsonGeometry} from 'geojson';
import {GeoJSONMapperService} from '../../../shared/services/geo-json-mapper.service';
import {DefaultHighlightStyles} from 'src/app/shared/configs/feature-info-config';
import * as dayjs from 'dayjs';
import {MapService} from '../../interfaces/map.service';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {LoadingState} from '../../../shared/types/loading-state';
import {ViewProcessState} from '../../../shared/types/view-process-state';
import {ZoomType} from '../../../shared/types/zoom-type';
import {BasemapConfigService} from '../basemap-config.service';
import {ConfigService} from '../../../shared/services/config.service';
import {selectActiveMapItems} from '../../../state/map/reducers/active-map-item.reducer';
import esriConfig from '@arcgis/core/config';
import wmsAuthAndUrlOverrideInterceptorFactory from './interceptors/override-wms-url.interceptor';
import {environment} from '../../../../environments/environment';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {AuthService} from '../../../auth/auth.service';
import {
  EsriBasemap,
  EsriColor,
  EsriGraphic,
  EsriLoadStatus,
  EsriMap,
  EsriMapView,
  EsriPoint,
  esriReactiveUtils,
  EsriScaleBar,
  EsriSimpleFillSymbol,
  EsriSimpleLineSymbol,
  EsriSimpleMarkerSymbol,
  EsriSpatialReference,
  EsriTileInfo,
  EsriWMSLayer,
  EsriWMSSublayer
} from '../../external/esri.module';
import {TimeSliderConfiguration, TimeSliderLayerSource, TimeSliderParameterSource} from '../../../shared/interfaces/topic.interface';
import {TimeExtent} from '../../interfaces/time-extent.interface';
import {MapFilter} from '../../interfaces/map-filter';

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
    feature: new EsriColor(this.defaultHighlightStyles.feature.color),
    outline: new EsriColor(this.defaultHighlightStyles.outline.color)
  };
  // TODO this should be moved to a config file
  private readonly highlightStyles = new Map<__esri.Geometry['type'], __esri.Symbol>([
    [
      'polyline',
      new EsriSimpleLineSymbol({
        color: this.highlightColors.feature,
        width: this.defaultHighlightStyles.feature.width
      })
    ],
    ['point', new EsriSimpleMarkerSymbol({color: this.highlightColors.feature})],
    ['multipoint', new EsriSimpleMarkerSymbol({color: this.highlightColors.feature})],
    ['polygon', new EsriSimpleFillSymbol({color: this.highlightColors.feature})]
  ]);
  private _mapView!: __esri.MapView;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor(
    private readonly store: Store,
    private readonly transformationService: TransformationService,
    private readonly geoJSONMapperService: GeoJSONMapperService,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    /**
     * Because the GetCapabalities response often sends a non-secure http://wms.zh.ch response, Esri Javascript API fails on https environments
     * to attach the token above if the urls is set to http://wms.zh.ch; because it automatically upgrades insecure links to https to avoid
     * mixed-content. This configuration forces the WMS to be upgraded to https.
     */
    esriConfig.request.httpsDomains?.push('wms.zh.ch');

    this.initializeInterceptors();
  }

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
    if (mapItem.timeSliderExtent) {
      // apply initial time slider settings
      this.setEsriTimeSliderExtent(mapItem.timeSliderExtent, mapItem, esriLayer);
    }
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
    const highlightedFeature = new EsriGraphic({geometry: esriGeometry, symbol: symbolization});

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
    this.mapView.center = new EsriPoint({x: x, y: y, spatialReference: new EsriSpatialReference({wkid: srsId})});
    this.mapView.scale = scale;
  }

  public setSublayerVisibility(visible: boolean, mapItem: ActiveMapItem, layerId: number) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof EsriWMSLayer) {
      const esriSubLayer = esriLayer.sublayers.find((sl) => sl.id === layerId);
      if (esriSubLayer) {
        esriSubLayer.visible = visible;
      }
    }
  }

  public setTimeSliderExtent(timeExtent: TimeExtent, mapItem: ActiveMapItem) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    this.setEsriTimeSliderExtent(timeExtent, mapItem, esriLayer);
  }

  public setActiveFilters(mapFilters: MapFilter[], mapItem: ActiveMapItem) {
    const esriLayer = this.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof EsriWMSLayer && mapItem.filterConfigurations) {
      const customLayerParameters: {[index: string]: string} = esriLayer.customLayerParameters ?? {};
      mapFilters.forEach((mf) => {
        const filterValues = mf.filterValues
          .map((fv) => {
            const values: string[] = fv.isActive ? fv.values.map(() => '') : fv.values;
            return values.map((v) => `'${v}'`).join(',');
          })
          .join(',');
        customLayerParameters[mf.parameter] = filterValues;
      });
      esriLayer.customLayerParameters = customLayerParameters;
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
    if (esriLayer && esriLayer instanceof EsriWMSLayer) {
      // the index of sublayers is identical to their position (in contrast to the map items) where the lowest index/position has the highest visibility
      esriLayer.sublayers.reorder(esriLayer.sublayers.getItemAt(previousPosition), currentPosition);
    }
  }

  private setEsriTimeSliderExtent(timeExtent: TimeExtent, mapItem: ActiveMapItem, esriLayer: __esri.Layer) {
    if (esriLayer && esriLayer instanceof EsriWMSLayer && mapItem.timeSliderConfiguration) {
      switch (mapItem.timeSliderConfiguration.sourceType) {
        case 'parameter':
          this.applyTimeSliderCustomParameters(esriLayer, timeExtent, mapItem.timeSliderConfiguration);
          break;
        case 'layer':
          this.synchronizeTimeSliderLayers(esriLayer, timeExtent, mapItem);
          break;
      }
      esriLayer.refresh();
    }
  }

  /**
   * Applies the time slider extent to the given layer by using custom WMS parameters.
   *
   * @remarks
   * Those parameters are defined in the corresponding time slider configuration sent by the source server.
   */
  private applyTimeSliderCustomParameters(
    esriLayer: __esri.WMSLayer,
    timeSliderExtent: TimeExtent,
    timeSliderConfiguration: TimeSliderConfiguration
  ) {
    const timeSliderParameterSource = timeSliderConfiguration.source as TimeSliderParameterSource;
    const dateFormat = timeSliderConfiguration.dateFormat;

    esriLayer.customLayerParameters = esriLayer.customLayerParameters ?? {};
    esriLayer.customLayerParameters[timeSliderParameterSource.startRangeParameter] = dayjs(timeSliderExtent.start).format(dateFormat);
    esriLayer.customLayerParameters[timeSliderParameterSource.endRangeParameter] = dayjs(timeSliderExtent.end).format(dateFormat);
  }

  /**
   * Applies the time slider extent to the given layer by adding/removing the corresponding WMS sub-layers.
   *
   * @remarks
   * Each time slider sub-layer corresponds to a time duration. The time slider is controlling the currently
   * visible data by adding/removing the corresponding sub-layers. However, there are other sub-layers in addition to
   * the time slider specific sub-layers which should not be modified in any way.
   * Therefore, first all time slider specific sub-layers are filtered. And from those only the ones which have a date inside the current
   * time extent are selected to be visible.
   */
  private synchronizeTimeSliderLayers(esriLayer: __esri.WMSLayer, timeSliderExtent: TimeExtent, mapItem: ActiveMapItem) {
    if (!mapItem.timeSliderConfiguration) {
      return;
    }

    const timeSliderConfig = mapItem.timeSliderConfiguration;
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    const timeSliderLayerNames = timeSliderLayerSource.layers.map((l) => l.layerName);
    const timeSliderLayerNamesToShow = timeSliderLayerSource.layers
      .filter((l) => {
        const date = dayjs(l.date, timeSliderConfig.dateFormat).toDate();
        return date >= timeSliderExtent.start && date < timeSliderExtent.end;
      })
      .map((l) => l.layerName);
    // get the layer configs of all time slider specific layers that are  also within the current time extent
    const layers = mapItem.layers.filter((l) => timeSliderLayerNamesToShow.includes(l.layer));
    // include all layers that are not specified in the time slider config
    const esriSublayers = esriLayer.sublayers.filter((sl) => !timeSliderLayerNames.includes(sl.name));
    // now add all layers that are in the time slider config and within the current time extent
    esriSublayers.addMany(
      layers.map(
        (layer) =>
          new EsriWMSSublayer({
            id: layer.id,
            name: layer.layer,
            title: layer.title,
            visible: true
          } as __esri.WMSSublayerProperties)
      )
    );
    esriLayer.sublayers = esriSublayers;
  }

  /**
   * We need several interceptors to trick ESRI Javascript API into working with the intricacies of the ZH GB2 configurations.
   * @private
   */
  private initializeInterceptors() {
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          tap(() => {
            const newInterceptor = this.getWmsOverrideInterceptor(this.authService.getAccessToken());
            esriConfig.request.interceptors = []; // todo: pop existing as soon as we add more interceptors
            esriConfig.request.interceptors.push(newInterceptor);
          })
        )
        .subscribe()
    );
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
    const scaleBar = new EsriScaleBar({view: this.mapView, container: 'scale-bar-container', unit: 'metric'});
    this.mapView.ui.add(scaleBar);
  }

  private createMap(initialBasemapId: string): __esri.Map {
    return new EsriMap({
      basemap: new EsriBasemap({
        baseLayers: this.basemapConfigService.availableBasemaps.map((baseMap) => {
          return new EsriWMSLayer({
            id: baseMap.id,
            url: baseMap.url,
            title: baseMap.title,
            spatialReference: new EsriSpatialReference({wkid: baseMap.srsId}),
            sublayers: baseMap.layers.map((basemapLayer) => ({name: basemapLayer.name})),
            visible: initialBasemapId === baseMap.id
          });
        })
      })
    });
  }

  private setMapView(map: __esri.Map, scale: number, x: number, y: number, srsId: number, minScale: number, maxScale: number) {
    const spatialReference = new EsriSpatialReference({wkid: srsId});
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
        lods: EsriTileInfo.create({
          spatialReference
        }).lods
      }
    });
  }

  private findEsriLayer(id: string): __esri.Layer {
    return this.mapView.map.layers.find((layer) => layer.id === id);
  }

  private attachMapViewListeners() {
    esriReactiveUtils.when(
      () => this.mapView.stationary,
      () => this.updateMapConfig()
    );

    esriReactiveUtils.on(
      () => this.mapView,
      'click',
      (event: __esri.ViewClickEvent) => {
        const {x, y} = this.transformationService.transform(event.mapPoint);
        this.dispatchFeatureInfoRequest(x, y);
      }
    );

    esriReactiveUtils
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

    esriReactiveUtils.on(
      () => this.mapView,
      'layerview-create',
      (event: __esri.ViewLayerviewCreateEvent) => {
        this.attachLayerViewListeners(event.layerView);
      }
    );
  }

  private attachLayerListeners(esriLayer: __esri.Layer) {
    // watch and initialize the loading state by observing the 'loadStatus' property
    esriReactiveUtils.watch(
      () => esriLayer.loadStatus,
      (loadStatus) => {
        this.updateLoadingState(loadStatus, esriLayer.id);
      }
    );
    this.updateLoadingState(esriLayer.loadStatus, esriLayer.id);
  }

  private attachLayerViewListeners(esriLayerView: __esri.LayerView) {
    // watch and initialize the view process state by observing the 'updating' property
    esriReactiveUtils.watch(
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

  private getWmsOverrideInterceptor(accessToken?: string): __esri.RequestInterceptor {
    const wmsOverrideUrl = environment.baseUrls.overrideWmsUrl;
    return wmsAuthAndUrlOverrideInterceptorFactory(wmsOverrideUrl, accessToken);
  }
}
