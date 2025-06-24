import {Inject, Injectable, OnDestroy} from '@angular/core';
import esriConfig from '@arcgis/core/config';
import * as affineTransformOperator from '@arcgis/core/geometry/operators/affineTransformOperator.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {Store} from '@ngrx/store';
import {BehaviorSubject, filter, first, map, pairwise, skip, Subscription, tap, withLatestFrom} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {InternalDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {GeometryWithSrs, PointWithSrs, PolygonWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {
  TimeSliderConfiguration,
  TimeSliderLayerSource,
  TimeSliderParameterSource,
  WmsFilterValue,
} from '../../../shared/interfaces/topic.interface';
import {ConfigService} from '../../../shared/services/config.service';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ViewProcessState} from '../../../shared/types/view-process-state.type';
import {ZoomType} from '../../../shared/types/zoom.type';
import {PrintUtils} from '../../../shared/utils/print.utils';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapConfigActions} from '../../../state/map/actions/map-config.actions';
import {selectAllItems} from '../../../state/map/selectors/active-map-items.selector';
import {selectDrawings} from '../../../state/map/reducers/drawing.reducer';
import {selectActiveBasemapId, selectMapConfigState, selectRotation} from '../../../state/map/reducers/map-config.reducer';
import {MapConfigState} from '../../../state/map/states/map-config.state';
import {MapService} from '../../interfaces/map.service';
import {TimeExtent} from '../../interfaces/time-extent.interface';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {DrawingActiveMapItem} from '../../models/implementations/drawing.model';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {BasemapConfigService} from '../basemap-config.service';
import {EsriMapViewService} from './esri-map-view.service';
import {EsriSymbolizationService} from './esri-symbolization.service';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {GeoJSONMapperService} from './geo-json-mapper.service';
import wmsAuthAndUrlOverrideInterceptorFactory from './interceptors/override-wms-url.interceptor';
import {EsriToolService} from './tool-service/esri-tool.service';
import {TransformationService} from './transformation.service';
import {ExternalWmsActiveMapItem} from '../../models/implementations/external-wms.model';
import {ExternalKmlActiveMapItem} from '../../models/implementations/external-kml.model';
import {ExternalWmsLayer} from '../../../shared/interfaces/external-layer.interface';
import {Gb3TopicsService} from '../../../shared/services/apis/gb3/gb3-topics.service';
import {InitialMapExtentService} from '../initial-map-extent.service';
import {MapConstants} from '../../../shared/constants/map.constants';
import {HitTestSelectionUtils} from './utils/hit-test-selection.utils';
import * as intl from '@arcgis/core/intl';
import {TimeService} from '../../../shared/interfaces/time-service.interface';
import {TIME_SERVICE} from '../../../app.module';
import {TimeSliderService} from '../time-slider.service';
import {ZoomExtentMissing} from './errors/esri.errors';
import {SymbolUnion} from '@arcgis/core/unionTypes';
import {hasNonNullishProperty} from './type-guards/esri-nullish.type-guard';
import Transformation from '@arcgis/core/geometry/operators/support/Transformation';
import KMLLayer from '@arcgis/core/layers/KMLLayer';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import Graphic from '@arcgis/core/Graphic';
import WMSSublayer from '@arcgis/core/layers/support/WMSSublayer';
import Basemap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import TileInfo from '@arcgis/core/layers/support/TileInfo';
import EsriMap from '@arcgis/core/Map';
import {EsriLoadStatus} from './types/esri-load-status.type';
import * as distanceOperator from '@arcgis/core/geometry/operators/distanceOperator.js';
import GraphicHit = __esri.GraphicHit;
import {MapViewWithMap} from './types/esri-mapview-with-map.type';

const DEFAULT_POINT_ZOOM_EXTENT_SCALE = 750;

const DEFAULT_COPYRIGHT = '© Kanton Zürich and MapServer Developers';

// used to distinguish between info-click and drawing-edit in the click listener
enum EsriMouseButtonType {
  LeftClick = 0,
  MiddleClick = 1,
  RightClick = 2,
}

@Injectable({
  providedIn: 'root',
})
export class EsriMapService implements MapService, OnDestroy {
  private effectiveMaxZoom = 23;
  private effectiveMinZoom = 0;
  private effectiveMinScale = 0;
  private isEditModeActive = false;
  private readonly printPreviewHandle$: BehaviorSubject<IHandle | null> = new BehaviorSubject<IHandle | null>(null);
  private readonly defaultMapConfig: MapConfigState = this.configService.mapConfig.defaultMapConfig;
  private readonly numberOfDrawingLayers = Object.keys(InternalDrawingLayer).length;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly activeBasemapId$ = this.store.select(selectActiveBasemapId);
  private readonly rotation$ = this.store.select(selectRotation);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly wmsImageFormatMimeType = this.configService.gb2Config.wmsFormatMimeType;

  constructor(
    private readonly store: Store,
    private readonly transformationService: TransformationService,
    private readonly geoJSONMapperService: GeoJSONMapperService,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly esriSymbolizationService: EsriSymbolizationService,
    private readonly esriMapViewService: EsriMapViewService,
    private readonly esriToolService: EsriToolService,
    private readonly gb3TopicsService: Gb3TopicsService,
    private readonly initialMapExtentService: InitialMapExtentService,
    private readonly timeSliderService: TimeSliderService,
    @Inject(TIME_SERVICE) private readonly timeService: TimeService,
  ) {
    /**
     * Because the GetCapabalities response often sends a non-secure http://wms.zh.ch response, Esri Javascript API fails on https
     * environments to attach the token above if the urls is set to http://wms.zh.ch; because it automatically upgrades insecure links to
     * https to avoid mixed-content. This configuration forces the WMS to be upgraded to https.
     */
    esriConfig.request.httpsDomains?.push('wms.zh.ch');
    /**
     * The Esri API uses the browser's locale settings to determine the language of the map. This can be overridden by setting the locale
     */
    intl.setLocale('de');

    this.initializeInterceptors();
    this.initializeSubscriptions();
  }

  private get mapView(): MapViewWithMap {
    return this.esriMapViewService.mapView;
  }

  private set mapView(value: __esri.MapView) {
    this.esriMapViewService.mapView = value;
  }

  public removeGeometryFromInternalDrawingLayer(drawingLayer: InternalDrawingLayer, id: string): void {
    const layer = this.esriMapViewService.findEsriLayer(this.createInternalLayerId(drawingLayer));
    if (layer && layer instanceof GraphicsLayer) {
      const graphicsToBeRemoved = layer.graphics.filter((graphic) => graphic.attributes[MapConstants.DRAWING_IDENTIFIER] === id).toArray();
      layer.removeMany(graphicsToBeRemoved);
    }
  }

  public moveLayerToTop(mapItem: ActiveMapItem) {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);

    if (esriLayer) {
      this.mapView.map.layers.reorder(esriLayer, this.mapView.map.layers.length - this.numberOfDrawingLayers - 1);
    }
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
        withLatestFrom(this.store.select(selectAllItems), this.store.select(selectDrawings)),
        tap(([config, activeMapItems, drawings]) => {
          const {x, y} = config.center;
          const {minScale, maxScale} = config.scaleSettings;
          const {scale, srsId, activeBasemapId} = config;
          const mapInstance = this.createMap(activeBasemapId);
          this.setMapView(mapInstance, scale, x, y, srsId, minScale, maxScale);
          this.attachMapViewListeners();
          this.addBasemapSubscription();
          this.rotationReset();
          this.initDrawingLayers();
          activeMapItems.forEach((mapItem, position) => {
            mapItem.addToMap(this, position);

            if (mapItem instanceof DrawingActiveMapItem) {
              const drawingsToAdd = drawings.filter((drawing) => drawing.source === mapItem.settings.userDrawingLayer);
              this.esriToolService.addExistingDrawingsToLayer(drawingsToAdd, mapItem.settings.userDrawingLayer);
            }
          });
          this.store.dispatch(MapConfigActions.markMapServiceAsInitialized());
        }),
      )
      .subscribe();
  }

  public addDrawingLayer(mapItem: DrawingActiveMapItem, position: number) {
    if (this.esriMapViewService.findEsriLayer(mapItem.id)) {
      return;
    }
    const graphicsLayer = new GraphicsLayer({
      id: mapItem.id,
    });

    const index = this.getIndexForPosition(position);
    this.mapView.map.add(graphicsLayer, index);
  }

  public addGb2WmsLayer(mapItem: Gb2WmsActiveMapItem, position: number) {
    const esriLayer = this.createWmsLayer(
      mapItem.id,
      mapItem.title,
      mapItem.settings.url,
      mapItem.visible,
      mapItem.opacity,
      mapItem.settings.layers.map(
        (layer): ExternalWmsLayer => ({type: 'wms', id: layer.id, name: layer.layer, title: layer.title, visible: layer.visible}),
      ),
      this.wmsImageFormatMimeType,
    );
    if (mapItem.settings.timeSliderExtent) {
      // apply initial time slider settings
      this.setEsriTimeSliderExtent(mapItem.settings.timeSliderExtent, mapItem, esriLayer);
    }
    if (mapItem.settings.filterConfigurations) {
      const attributeFilterParameters = this.gb3TopicsService.transformFilterConfigurationToParameters(
        mapItem.settings.filterConfigurations,
      );
      // apply initial attribute filter settings
      this.setEsriAttributeFilters(attributeFilterParameters, esriLayer);
    }
    this.addLayer(esriLayer, position);
  }

  public addExternalWmsLayer(mapItem: ExternalWmsActiveMapItem, position: number) {
    const esriLayer = this.createWmsLayer(
      mapItem.id,
      mapItem.title,
      mapItem.settings.url,
      mapItem.visible,
      mapItem.opacity,
      mapItem.settings.layers,
      mapItem.settings.imageFormat,
    );
    this.addLayer(esriLayer, position);
  }

  public addExternalKmlLayer(mapItem: ExternalKmlActiveMapItem, position: number) {
    const esriLayer: __esri.Layer = new KMLLayer({
      id: mapItem.id,
      title: mapItem.title,
      url: mapItem.settings.url,
      visible: mapItem.visible,
      opacity: mapItem.opacity,
      sublayers: mapItem.settings.layers
        .map((layer): __esri.KMLSublayerProperties => {
          return {
            id: layer.id,
            title: layer.title,
            visible: layer.visible,
          };
        })
        .reverse(), // reverse the order of the sublayers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted to the
      // order of the KML specifications
    });
    this.addLayer(esriLayer, position);
  }

  public removeMapItem(id: string) {
    const esriLayer = this.esriMapViewService.findEsriLayer(id);
    if (esriLayer) {
      this.mapView.map.remove(esriLayer);
    }
  }

  public removeAllMapItems() {
    // remove all non-internal layers
    const nonInternalLayers = this.mapView.map.layers.filter(
      (layer) => !layer.id.startsWith(this.configService.mapConfig.internalLayerPrefix),
    );
    this.mapView.map.removeMany(nonInternalLayers.toArray());

    // clear all internal graphic layers
    const internalLayers = this.mapView.map.layers.filter(
      (layer) => layer.id.startsWith(this.configService.mapConfig.internalLayerPrefix) && layer instanceof GraphicsLayer,
    );
    internalLayers.forEach((internalLayer) => {
      (internalLayer as GraphicsLayer).removeAll();
    });
  }

  public assignMapElement(container: HTMLDivElement) {
    this.mapView.container = container;
  }

  public setOpacity(opacity: number, mapItem: ActiveMapItem): void {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);
    if (esriLayer) {
      esriLayer.opacity = opacity;
    }
  }

  public setVisibility(visible: boolean, mapItem: ActiveMapItem): void {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);
    if (esriLayer) {
      esriLayer.visible = visible;
    }
  }

  public resetExtent() {
    const {x, y, scale} = this.initialMapExtentService.calculateInitialExtent();
    this.mapView.center = new Point({x, y, spatialReference: new SpatialReference({wkid: this.defaultMapConfig.srsId})});
    this.mapView.scale = scale;
  }

  public setSublayerVisibility(visible: boolean, mapItem: ActiveMapItem, layerId: number) {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof WMSLayer) {
      const esriSubLayer = esriLayer.sublayers.find((sl) => sl.id === layerId);
      if (esriSubLayer) {
        esriSubLayer.visible = visible;
      }
    }
  }

  public setMapCenter(center: PointWithSrs): Promise<never> {
    return this.mapView.goTo({
      center: this.createGeoReferencedPoint(center),
    }) as never;
  }

  public setTimeSliderExtent(timeExtent: TimeExtent, mapItem: Gb2WmsActiveMapItem) {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);

    if (esriLayer) {
      this.setEsriTimeSliderExtent(timeExtent, mapItem, esriLayer);
    }
  }

  public setAttributeFilters(attributeFilterParameters: WmsFilterValue[], mapItem: Gb2WmsActiveMapItem) {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);

    if (esriLayer) {
      this.setEsriAttributeFilters(attributeFilterParameters, esriLayer);
    }
  }

  public reorderMapItem(previousPosition: number, currentPosition: number) {
    /**
     * `position` is the map/layer position from the state/GUI: lowest position <=> highest visibility
     * `index` is the position inside the Esri layer array. It's inverse to the position from the state/GUI: the lowest index <=> lowest
     * visibility. Additionally, there is a number of default layers that must always keep the highest visibility (e.g. highlight layer)
     * independent from the state/GUI layers.
     */
    const previousIndex = this.getNumberOfNonDrawingLayers() - 1 - previousPosition;
    const currentIndex = this.getNumberOfNonDrawingLayers() - 1 - currentPosition;

    const layer = this.mapView.map.layers.getItemAt(previousIndex);
    if (layer) {
      this.mapView.map.layers.reorder(layer, currentIndex);
    }
  }

  public reorderSublayer(mapItem: ActiveMapItem, previousPosition: number, currentPosition: number) {
    const esriLayer = this.esriMapViewService.findEsriLayer(mapItem.id);
    if (esriLayer && esriLayer instanceof WMSLayer) {
      /**
       * `position` is the map/layer position from the state/GUI: lowest position <=> highest visibility
       * `index` is the position inside the Esri layer array. It's inverse to the position from the state/GUI: the lowest index <=> lowest
       * visibility. Additionally, there is a number of default layers that must always keep the highest visibility (e.g. highlight layer)
       * independent from the state/GUI layers.
       */
      const previousIndex = esriLayer.sublayers.length - 1 - previousPosition;
      const currentIndex = esriLayer.sublayers.length - 1 - currentPosition;

      const layer = esriLayer.sublayers.getItemAt(previousIndex);
      if (layer) {
        esriLayer.sublayers.reorder(layer, currentIndex);
      }
    }
  }

  public zoomToPoint(point: PointWithSrs, scale: number): Promise<never> {
    return this.mapView.goTo({
      center: this.createGeoReferencedPoint(point),
      scale: scale,
    }) as never;
  }

  public zoomToExtent(geometry: GeometryWithSrs, expandFactor: number = 1, duration?: number): Promise<never> {
    const esriGeometry = this.geoJSONMapperService.fromGeoJSONToEsri(geometry);

    if (esriGeometry instanceof Point) {
      return this.mapView.goTo(
        {
          center: esriGeometry,
          scale: DEFAULT_POINT_ZOOM_EXTENT_SCALE,
        },
        {duration},
      ) as never;
    }

    if (hasNonNullishProperty(esriGeometry, 'extent')) {
      return this.mapView.goTo(
        {
          center: esriGeometry.extent.clone().expand(expandFactor),
        },
        {duration},
      ) as never;
    }

    throw new ZoomExtentMissing();
  }

  public addGeometryToInternalDrawingLayer(geometry: GeometryWithSrs, drawingLayer: InternalDrawingLayer, id?: string) {
    const symbolization = this.esriSymbolizationService.createSymbolizationForDrawingLayer(geometry, drawingLayer);
    const esriGeometry = this.geoJSONMapperService.fromGeoJSONToEsri(geometry);
    this.addEsriGeometryToDrawingLayer(esriGeometry, symbolization, drawingLayer, id);
  }

  public clearInternalDrawingLayer(internalDrawingLayer: InternalDrawingLayer) {
    const layer = this.esriMapViewService.findEsriLayer(this.createInternalLayerId(internalDrawingLayer));
    if (layer) {
      (layer as __esri.GraphicsLayer).removeAll();
    }
  }

  public getToolService(): EsriToolService {
    return this.esriToolService;
  }

  public async startDrawPrintPreview(extentWidth: number, extentHeight: number, rotation: number): Promise<void> {
    // listen to any map center changes and redraw the print preview area to keep it in the center of the map
    // the old print preview handle gets removed automatically using a subscription that listens to the value changes and removes old
    // handlers
    this.printPreviewHandle$.next(
      reactiveUtils.watch(
        () => [this.mapView.center.x, this.mapView.center.y],
        ([x, y]) => {
          // redraw the print preview area if either the x or the y coordinate of the map center changes so that it is always in the center
          this.handlePrintPreview({x, y}, extentWidth, extentHeight, rotation);
        },
      ),
    );

    // draw the new geometry once as it is entirely possible that the map center didn't change yet and then zoom to the geometry.
    const geometryWithSrs: PolygonWithSrs = this.handlePrintPreview(this.mapView.center, extentWidth, extentHeight, rotation);
    await this.zoomToExtent(
      geometryWithSrs,
      this.configService.mapAnimationConfig.zoom.expandFactor,
      this.configService.mapAnimationConfig.zoom.duration,
    );
  }

  public stopDrawPrintPreview() {
    this.printPreviewHandle$.next(null);
    this.clearInternalDrawingLayer(InternalDrawingLayer.PrintPreview);
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public setRotationAngle(rotation: number) {
    this.mapView.rotation = rotation;
  }

  public cancelEditMode() {
    this.isEditModeActive = false;
    this.esriToolService.cancelTool();
  }

  private createWmsLayer(
    id: string,
    title: string,
    url: string,
    visible: boolean,
    opacity: number,
    layers: ExternalWmsLayer[],
    imageFormat: string | undefined,
  ): __esri.WMSLayer {
    const esriLayer = new WMSLayer({
      id: id,
      title: title,
      url: url,
      visible: visible,
      opacity: opacity,
      imageFormat: imageFormat,
      sublayers: layers
        .map((layer): __esri.WMSSublayerProperties => {
          return {
            id: layer.id,
            name: layer.name,
            title: layer.title,
            visible: layer.visible,
          };
        })
        .reverse(), // reverse the order of the sublayers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted to the
      // order of the WMS specifications
    });
    return esriLayer;
  }

  private addLayer(esriLayer: __esri.Layer, position: number) {
    if (this.esriMapViewService.findEsriLayer(esriLayer.id)) {
      return;
    }
    this.attachLayerListeners(esriLayer);
    /**
     * `position` is the map/layer position from the state/GUI: lowest position <=> highest visibility
     * `index` is the position inside the Esri layer array. It's inverse to the position from the state/GUI: the lowest index <=> lowest
     * visibility Additionally, there is a number of default layers that must always keep the highest visibility (e.g. highlight layer)
     * independent from the state/GUI layers.
     */
    const index = this.getIndexForPosition(position);
    this.mapView.map.add(esriLayer, index);
  }

  private addEsriGeometryToDrawingLayer(
    esriGeometry: __esri.Geometry,
    esriSymbolization: SymbolUnion,
    internalDrawingLayer: InternalDrawingLayer,
    id?: string,
  ) {
    const graphicItem = new Graphic({
      geometry: esriGeometry,
      symbol: esriSymbolization,
      attributes: {[MapConstants.DRAWING_IDENTIFIER]: id},
    });
    const targetLayer = this.esriMapViewService.findEsriLayer(this.createInternalLayerId(internalDrawingLayer));
    if (targetLayer) {
      (targetLayer as __esri.GraphicsLayer).add(graphicItem);
    }
  }

  private handlePrintPreview(
    center: {
      x: number;
      y: number;
    },
    extentWidth: number,
    extentHeight: number,
    rotation: number,
  ): PolygonWithSrs {
    const printPreviewArea = PrintUtils.createPrintPreviewArea(center, extentWidth, extentHeight);
    const symbolization = this.esriSymbolizationService.createSymbolizationForDrawingLayer(
      printPreviewArea,
      InternalDrawingLayer.PrintPreview,
    );
    const esriGeometry = this.geoJSONMapperService.fromGeoJSONToEsri(printPreviewArea);

    // create a transformation object and apply the negative rotation since esri rotates counter-clockwise
    const transformation = new Transformation();
    transformation.rotate(-rotation, center.x, center.y);
    const rotatedEsriGeometry = affineTransformOperator.execute(esriGeometry, transformation);

    this.clearInternalDrawingLayer(InternalDrawingLayer.PrintPreview);
    this.addEsriGeometryToDrawingLayer(rotatedEsriGeometry, symbolization, InternalDrawingLayer.PrintPreview);
    return printPreviewArea;
  }

  /**
   * `position` is the map/layer position from the state/GUI: lowest position <=> highest visibility
   * `index` is the position inside the Esri layer array. It's inverse to the position from the state/GUI: the lowest index <=> lowest
   * visibility Additionally, there is a number of default layers that must always keep the highest visibility (e.g. highlight layer)
   * independent from the state/GUI layers.
   */
  private getIndexForPosition(position: number) {
    return this.getNumberOfNonDrawingLayers() - position;
  }

  private initDrawingLayers() {
    Object.values(InternalDrawingLayer).forEach((drawingLayer) => {
      const graphicsLayer = new GraphicsLayer({
        id: this.createInternalLayerId(drawingLayer),
      });

      this.mapView.map.add(graphicsLayer);
    });
  }

  private createInternalLayerId(internalDrawingLayer: InternalDrawingLayer): string {
    return `${this.configService.mapConfig.internalLayerPrefix}${internalDrawingLayer}`;
  }

  /**
   * Returns the number of layers without counting DrawingLayers. Used whenever user-provided layers are dealt with in order to exclude the
   * fixed internal DrawingLayers.
   * @private
   */
  private getNumberOfNonDrawingLayers(): number {
    return this.mapView.map.layers.length - this.numberOfDrawingLayers;
  }

  private createGeoReferencedPoint({coordinates, srs}: PointWithSrs): __esri.Point {
    return new Point({spatialReference: {wkid: srs}, x: coordinates[0], y: coordinates[1]});
  }

  private setEsriTimeSliderExtent(timeExtent: TimeExtent, mapItem: Gb2WmsActiveMapItem, esriLayer: __esri.Layer) {
    if (esriLayer instanceof WMSLayer && mapItem.settings.timeSliderConfiguration) {
      switch (mapItem.settings.timeSliderConfiguration.sourceType) {
        case 'parameter':
          this.applyTimeSliderCustomParameters(esriLayer, timeExtent, mapItem.settings.timeSliderConfiguration);
          break;
        case 'layer':
          this.synchronizeTimeSliderLayers(esriLayer, timeExtent, mapItem);
          break;
      }
      esriLayer.refresh();
    }
  }

  private setEsriAttributeFilters(attributeFilterParameters: WmsFilterValue[], esriLayer: __esri.Layer) {
    if (esriLayer instanceof WMSLayer) {
      const customLayerParameters: {[index: string]: string} = esriLayer.customLayerParameters ?? {};
      attributeFilterParameters.forEach((attributeFilterParameter) => {
        customLayerParameters[attributeFilterParameter.name] = attributeFilterParameter.value;
      });
      esriLayer.customLayerParameters = customLayerParameters;
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
    timeSliderConfiguration: TimeSliderConfiguration,
  ) {
    const timeSliderParameterSource = timeSliderConfiguration.source as TimeSliderParameterSource;
    const dateFormat = timeSliderConfiguration.dateFormat;

    esriLayer.customLayerParameters = esriLayer.customLayerParameters ?? {};
    esriLayer.customLayerParameters[timeSliderParameterSource.startRangeParameter] = this.timeService.getDateAsUTCString(
      timeSliderExtent.start,
      dateFormat,
    );
    esriLayer.customLayerParameters[timeSliderParameterSource.endRangeParameter] = this.timeService.getDateAsUTCString(
      timeSliderExtent.end,
      dateFormat,
    );
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
  private synchronizeTimeSliderLayers(esriLayer: __esri.WMSLayer, timeSliderExtent: TimeExtent, mapItem: Gb2WmsActiveMapItem) {
    if (!mapItem.settings.timeSliderConfiguration) {
      return;
    }

    const timeSliderConfig = mapItem.settings.timeSliderConfiguration;
    const timeSliderLayerSource = timeSliderConfig.source as TimeSliderLayerSource;
    const timeSliderLayerNames = timeSliderLayerSource.layers.map((layer) => layer.layerName);
    const visibleTimeSliderLayers = mapItem.settings.layers.filter(
      (layer) => this.timeSliderService.isLayerVisible(layer, mapItem.settings.timeSliderConfiguration, timeSliderExtent) === true,
    );
    // include all layers that are not specified in the time slider config
    const esriSublayers = esriLayer.sublayers.filter((sublayer) => !timeSliderLayerNames.includes(sublayer.name));
    // now add all layers that are in the time slider config and within the current time extent
    esriSublayers.addMany(
      visibleTimeSliderLayers
        .map(
          (layer) =>
            new WMSSublayer({
              id: layer.id,
              name: layer.layer,
              title: layer.title,
              visible: true,
            } as __esri.WMSSublayerProperties),
        )
        .reverse(), // reverse the order of the sublayers because the order in the GB3 interfaces (Topic, ActiveMapItem) is inverted to the
      // order of the WMS specifications
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
            esriConfig.request.interceptors = []; // pop existing as soon as we add more interceptors
            esriConfig.request.interceptors.push(newInterceptor);
          }),
        )
        .subscribe(),
    );
  }

  private initializeSubscriptions() {
    this.subscriptions.add(
      /**
       * This pipe tracks the active print preview handle changes and automatically destroys old handles properly.
       * Otherwise this could result in potential memory leaks as we could lose the reference to
       * an old (but still active) handle which will be still active in the background forever.
       */
      this.printPreviewHandle$
        .pipe(
          pairwise(),
          map(([previousHandle, activeHandle]) => {
            if (previousHandle) {
              // properly destroy the old handle
              previousHandle.remove();
            }
            return activeHandle;
          }),
        )
        .subscribe(),
    );
  }

  private addBasemapSubscription() {
    this.subscriptions.add(
      this.activeBasemapId$
        .pipe(
          skip(1), // Skip first, because the first is set by init()
          tap((activeBasemapId) => {
            this.switchBasemap(activeBasemapId);
          }),
        )
        .subscribe(),
    );
  }

  private rotationReset() {
    this.subscriptions.add(
      this.rotation$
        .pipe(
          filter((rotation) => rotation === 0),
          tap((rotation) => {
            this.setRotationAngle(rotation);
          }),
        )
        .subscribe(),
    );
  }

  private createMap(initialBasemapId: string): EsriMap {
    return new EsriMap({
      basemap: new Basemap({
        baseLayers: this.basemapConfigService.availableBasemaps.map((baseMap) => {
          switch (baseMap.type) {
            case 'wms':
              return new WMSLayer({
                id: baseMap.id,
                url: baseMap.url,
                title: baseMap.title,
                spatialReference: new SpatialReference({wkid: baseMap.srsId}),
                sublayers: baseMap.layers.map((basemapLayer) => ({name: basemapLayer.name})),
                visible: initialBasemapId === baseMap.id,
                imageFormat: this.wmsImageFormatMimeType,
              });
            case 'blank':
              return new FeatureLayer({
                id: baseMap.id,
                geometryType: 'point', // a feature layer needs a geometry and 'point' is the simplest one
                objectIdField: 'ObjectID', // a feature layer needs this property even if its never used
                title: baseMap.title,
                source: [], // empty source as this is a blank basemap
                spatialReference: new SpatialReference({wkid: this.configService.mapConfig.defaultMapConfig.srsId}),
                visible: initialBasemapId === baseMap.id,
                copyright: DEFAULT_COPYRIGHT,
              });
          }
        }),
      }),
    });
  }

  private setMapView(mapInstance: __esri.Map, scale: number, x: number, y: number, srsId: number, minScale: number, maxScale: number) {
    const spatialReference = new SpatialReference({wkid: srsId});
    this.mapView = new MapView({
      map: mapInstance,
      ui: {
        components: ['attribution'],
      },
      scale,
      center: new Point({x, y, spatialReference}),
      constraints: {
        snapToZoom: false,
        minScale,
        maxScale,
        lods: TileInfo.create({
          /**
           * This number seems to be required for Esri to generate enough ZoomLevels to also include 1:1. Setting it to anything below 32
           * will lead to an inversion of levels, only allowing for zooming from 1:1500000 to 1:VERYLARGENUMBER.
           *
           * See https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-TileInfo.html#create
           *
           * Note that increasing this number will not add anything more; the minimum scale will still be calculated at an approximation of
           * MAPCONSTANTS.minScale.
           */
          numLODs: 32,
          spatialReference,
        }).lods,
      },
      spatialReference,
      popupEnabled: false,
    });
  }

  private updateReferenceDistance() {
    const referenceDistanceInMeters = this.calculateReferenceDistanceInMeters();
    this.store.dispatch(MapConfigActions.setReferenceDistance({referenceDistanceInMeters}));
  }

  private attachMapViewListeners() {
    reactiveUtils.when(
      () => this.mapView.stationary,
      () => this.updateMapConfig(),
    );

    // ensure that the reference distance is calculated after the map is ready, since the scale listener only fires after the first change
    reactiveUtils.whenOnce(() => this.mapView.ready).then(() => this.updateReferenceDistance());
    reactiveUtils.watch(
      () => this.mapView.scale,
      () => this.updateReferenceDistance(),
    );

    reactiveUtils.on(
      () => this.mapView,
      'click',
      async (event: __esri.ViewClickEvent) => {
        if (event.button === EsriMouseButtonType.LeftClick) {
          const {x, y} = this.transformationService.transform(event.mapPoint);
          if (this.isEditModeActive) {
            this.isEditModeActive = false;
          } else {
            this.dispatchFeatureInfoRequest(x, y);
          }
        } else if (event.button === EsriMouseButtonType.RightClick) {
          const layersToTest = this.mapView.map.layers
            .filter((layer) => this.configService.mapConfig.editableLayerIds.includes(layer.id))
            .toArray();
          const {results} = await this.mapView.hitTest(event, {include: layersToTest});
          const selectedFeature = HitTestSelectionUtils.selectFeatureFromHitTestResult(results as GraphicHit[]);
          if (selectedFeature) {
            this.isEditModeActive = true;
            this.esriToolService.editDrawing(selectedFeature);
          }
        }
      },
    );

    reactiveUtils.watch(
      () => this.mapView.rotation,
      (rotation) => {
        this.dispatchRotationEvent(rotation);
      },
    );

    reactiveUtils
      .whenOnce(() => this.mapView.ready && this.transformationService.projectionOperatorLoaded)
      .then(() => {
        const {effectiveMaxScale, effectiveMinScale, effectiveMaxZoom, effectiveMinZoom} = this.mapView.constraints;

        this.effectiveMaxZoom = effectiveMaxZoom!;
        this.effectiveMinZoom = effectiveMinZoom!;
        this.effectiveMinScale = effectiveMinScale!;

        this.store.dispatch(
          MapConfigActions.setReady({
            calculatedMinScale: effectiveMinScale!,
            calculatedMaxScale: effectiveMaxScale!,
          }),
        );
      });

    reactiveUtils.on(
      () => this.mapView,
      'layerview-create',
      (event: __esri.ViewLayerviewCreateEvent) => {
        this.attachLayerViewListeners(event.layerView);
      },
    );
  }

  private attachLayerListeners(esriLayer: __esri.Layer) {
    // watch and initialize the loading state by observing the 'loadStatus' property
    reactiveUtils.watch(
      () => esriLayer.loadStatus,
      (loadStatus) => {
        this.updateLoadingState(loadStatus, esriLayer.id);
      },
    );
    this.updateLoadingState(esriLayer.loadStatus, esriLayer.id);
  }

  private attachLayerViewListeners(esriLayerView: __esri.LayerView) {
    // watch and initialize the view process state by observing the 'updating' property
    reactiveUtils.watch(
      () => esriLayerView.updating,
      (updating) => {
        this.updateViewProcessState(updating, esriLayerView.layer?.id);
      },
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
      return undefined;
    }
    switch (loadStatus) {
      case 'not-loaded':
        return undefined;
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
      return undefined;
    }
    return updating ? 'updating' : 'completed';
  }

  private dispatchFeatureInfoRequest(x: number, y: number) {
    this.store.dispatch(MapConfigActions.handleMapClick({x, y}));
  }

  private dispatchRotationEvent(rotation: number) {
    this.store.dispatch(MapConfigActions.handleMapRotation({rotation}));
  }

  private updateMapConfig() {
    const {center, scale} = this.mapView;
    const {x, y} = this.transformationService.transform(center);
    this.store.dispatch(MapConfigActions.setMapExtent({x, y, scale}));
  }

  /**
   * Calculates the reference distance in meters for the scale bar. What we do is that we calculate the distance between two pixel
   * coordinates which have the same y coordinate (half of the screen height) and as x use 0 and the reference width. This way, we get a
   * distance which is known, which can be used by the scale bar to calculate its width.
   */
  private calculateReferenceDistanceInMeters(): number {
    const screenHeight = this.mapView.height / 2;
    const pointA = this.mapView.toMap({x: 0, y: screenHeight});
    const pointB = this.mapView.toMap({x: MapConstants.MAX_SCALE_BAR_WIDTH_PX, y: screenHeight});

    return distanceOperator.execute(pointA, pointB, {unit: 'meters'});
  }

  private switchBasemap(basemapId: string) {
    this.mapView.map.basemap?.baseLayers.forEach((baseLayer) => {
      baseLayer.visible = basemapId === baseLayer.id;
    });
  }

  private getWmsOverrideInterceptor(accessToken?: string): __esri.RequestInterceptor {
    const wmsOverrideUrl = this.configService.overridesConfig.overrideWmsUrl;
    const {gb2Wms, gb2WmsCapabilities} = this.configService.apiConfig;
    return wmsAuthAndUrlOverrideInterceptorFactory([gb2Wms.baseUrl, gb2WmsCapabilities.baseUrl], wmsOverrideUrl, accessToken);
  }
}
