import {Injectable, OnDestroy} from '@angular/core';
import {ToolService} from '../../../interfaces/tool.service';
import {EsriMapViewService} from '../esri-map-view.service';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {ActiveMapItemFactory} from '../../../../shared/factories/active-map-item.factory';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import {selectDrawingLayers} from '../../../../state/map/selectors/drawing-layers.selector';
import {Subscription, tap} from 'rxjs';
import {EsriToolStrategy} from './interfaces/strategy.interface';
import {EsriDefaultStrategy} from './strategies/measurement/esri-default.strategy';
import {EsriLineMeasurementStrategy} from './strategies/measurement/esri-line-measurement.strategy';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {EsriSymbolizationService} from '../esri-symbolization.service';
import {UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {DrawingActiveMapItem} from '../../../models/implementations/drawing.model';
import {EsriAreaMeasurementStrategy} from './strategies/measurement/esri-area-measurement.strategy';
import {EsriPointMeasurementStrategy} from './strategies/measurement/esri-point-measurement.strategy';
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {MeasurementTool} from '../../../../shared/types/measurement-tool.type';
import {DrawingTool} from '../../../../shared/types/drawing-tool.type';
import {ConfigService} from '../../../../shared/services/config.service';
import {EsriPointDrawingStrategy} from './strategies/drawing/esri-point-drawing.strategy';
import {EsriLineDrawingStrategy} from './strategies/drawing/esri-line-drawing.strategy';
import {EsriPolygonDrawingStrategy} from './strategies/drawing/esri-polygon-drawing.strategy';
import {DrawingCallbackHandler} from './interfaces/drawing-callback-handler.interface';
import {TransformationService} from '../transformation.service';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import {Feature} from 'geojson';
import Graphic from '@arcgis/core/Graphic';
import {arcgisToGeoJSON} from '@terraformer/arcgis';

const HANDLE_GROUP_KEY = 'EsriToolService';

/**
 * Handles the measurement and sketch drawings. It employs the Strategy pattern to delegate the actual drawing logic to dedicated
 * strategies. This service only handles the instantiation of the correct strategy and acts as a mediator for interacting with the
 * strategies.
 *
 * Due to the nature of Esri's SketchViewModel implementation, a lot is handled implicitly. There is no need to deactivate an active
 * SketchViewModel if another one becomes active (i.e. the tools are switched) since that happens automatically. Two quirks exist, however:
 * * Each strategy takes a callback for the completion - since we need to know for our state when a tool is done (and can be removed
 * from the activeTool state property), this callback is used by the SketchViewModel.on() handler upon draw completion. Other events do
 * NOT fire anything, but be careful if you're adding more logic - i.e. the `cancel` event should not fire any event that dispatches a
 * state change, because this might lead to race conditions.
 * * Because Esri cancels drawings when pressing escape, we need to intercept this in order for our state to become updated. This is
 * done via custom handles on the MapView object which manually fire the deactivation event for our state to become updated.
 */
@Injectable({
  providedIn: 'root',
})
export class EsriToolService implements ToolService, OnDestroy, DrawingCallbackHandler {
  private toolStrategy: EsriToolStrategy = new EsriDefaultStrategy();
  private drawingLayers: DrawingActiveMapItem[] = [];
  private readonly drawingLayers$ = this.store.select(selectDrawingLayers);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly esriMapViewService: EsriMapViewService,
    private readonly store: Store,
    private readonly esriSymbolizationService: EsriSymbolizationService,
    private readonly configService: ConfigService,
    private readonly transformationService: TransformationService,
  ) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public cancelTool() {
    this.toolStrategy.cancel();
  }

  public initializeDrawing(drawingTool: DrawingTool) {
    this.initializeTool(UserDrawingLayer.Drawings, (layer) => this.setDrawingStrategy(drawingTool, layer));
  }

  public initializeMeasurement(measurementTool: MeasurementTool): void {
    this.initializeTool(UserDrawingLayer.Measurements, (layer) => this.setMeasurementStrategy(measurementTool, layer));
  }

  /**
   * Initializes a given tool by handling the addition and/or visibility setting ot the drawing layer and uses the supplied setter
   * function to set the correct toolStrategy.
   * @param layerIdentifier Layer name within the map that should be used as identifier
   * @param strategySetter A setter function that takes a given layer and sets a strategy for the given tool.
   * @private
   */
  private initializeTool(layerIdentifier: UserDrawingLayer, strategySetter: (layer: GraphicsLayer) => void) {
    const fullLayerIdentifier = this.configService.mapConfig.userDrawingLayerPrefix + layerIdentifier;
    const drawingLayer = this.esriMapViewService.findEsriLayer(fullLayerIdentifier);

    if (!drawingLayer) {
      /**
       * In case we don't have a drawing layer yet, we add it to the map. However, because this is not done immediately, we need a one-off
       * listener to this layer in order to then start the drawing functionality when the layer is effectively added. Starting the drawing
       * immediately after dispatching the layer addition will yield undefined errors.
       */
      reactiveUtils
        .once(() => this.esriMapViewService.findEsriLayer(fullLayerIdentifier))
        .then((layer) => {
          strategySetter(layer as GraphicsLayer);
          this.startDrawing();
        });

      const drawingLayerAdd = ActiveMapItemFactory.createDrawingMapItem(
        layerIdentifier,
        this.configService.mapConfig.userDrawingLayerPrefix,
      );
      this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: drawingLayerAdd, position: 0}));
    } else {
      this.forceVisibility(fullLayerIdentifier);
      strategySetter(drawingLayer as GraphicsLayer);
      this.startDrawing();
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.drawingLayers$.pipe(tap((drawingLayers) => (this.drawingLayers = drawingLayers))).subscribe());
  }

  private startDrawing() {
    this.registerEscapeEventHandler();
    this.toolStrategy.start();
  }

  public complete(graphics: Graphic[]) {
    const geoJsonGeometries: Feature[] = [];
    graphics.map((graphic) => {
      const transformedGeometry = this.transformationService.transformTo(graphic.geometry, new SpatialReference({wkid: 4326}));
      geoJsonGeometries.push({
        type: 'Feature',
        geometry: {...arcgisToGeoJSON(transformedGeometry)},
        properties: graphic.attributes,
      });
    });
    this.endDrawing(geoJsonGeometries);
  }

  private endDrawing(features?: Feature[]) {
    this.esriMapViewService.mapView.removeHandles(HANDLE_GROUP_KEY);
    this.store.dispatch(ToolActions.deactivateTool({features}));
  }

  /**
   * Adds an event handler on the mapView object for catching the Escape button. Since the Escape button triggers a tool cancellation,
   * we need to intercept this and end the drawing on the service as well.
   * @private
   */
  private registerEscapeEventHandler() {
    const handle = reactiveUtils.on(
      () => this.esriMapViewService.mapView,
      'key-down',
      (event) => {
        if (event.key === 'Escape') {
          this.endDrawing();
        }
      },
    );
    this.esriMapViewService.mapView.addHandles(handle, HANDLE_GROUP_KEY);
  }

  /**
   * Forces the drawing layer to become visible to prevent users from measuring on transparent or invisible drawing layers.
   * @private
   */
  private forceVisibility(fullLayerIdentifier: string) {
    const activeMapItem = this.drawingLayers.find((l) => l.id === fullLayerIdentifier);

    if (activeMapItem) {
      this.store.dispatch(ActiveMapItemActions.forceFullVisibility({activeMapItem}));
    }
  }

  private setMeasurementStrategy(measurementType: MeasurementTool, layer: GraphicsLayer) {
    // because we currently do not have pictures symbols, the pointStyle is cast to SimpleMarkerSymbol.
    const pointStyle = this.esriSymbolizationService.createPointSymbolization(UserDrawingLayer.Measurements) as SimpleMarkerSymbol;
    const lineStyle = this.esriSymbolizationService.createLineSymbolization(UserDrawingLayer.Measurements);
    const areaStyle = this.esriSymbolizationService.createPolygonSymbolization(UserDrawingLayer.Measurements);
    const labelStyle = this.esriSymbolizationService.createTextSymbolization(UserDrawingLayer.Measurements);

    switch (measurementType) {
      case 'measure-area':
        this.toolStrategy = new EsriAreaMeasurementStrategy(layer, this.esriMapViewService.mapView, areaStyle, labelStyle, (geometry) =>
          this.complete(geometry),
        );
        break;
      case 'measure-line':
        this.toolStrategy = new EsriLineMeasurementStrategy(layer, this.esriMapViewService.mapView, lineStyle, labelStyle, (geometry) =>
          this.complete(geometry),
        );
        break;
      case 'measure-point':
        this.toolStrategy = new EsriPointMeasurementStrategy(layer, this.esriMapViewService.mapView, pointStyle, labelStyle, (geometry) =>
          this.complete(geometry),
        );
    }
  }

  private setDrawingStrategy(drawingType: DrawingTool, layer: GraphicsLayer) {
    const pointStyle = this.esriSymbolizationService.createPointSymbolization(UserDrawingLayer.Drawings) as SimpleMarkerSymbol;
    const lineStyle = this.esriSymbolizationService.createLineSymbolization(UserDrawingLayer.Drawings);
    const areaStyle = this.esriSymbolizationService.createPolygonSymbolization(UserDrawingLayer.Drawings);

    switch (drawingType) {
      case 'draw-point':
        this.toolStrategy = new EsriPointDrawingStrategy(layer, this.esriMapViewService.mapView, pointStyle, (geometry) =>
          this.complete(geometry),
        );
        break;
      case 'draw-line':
        this.toolStrategy = new EsriLineDrawingStrategy(layer, this.esriMapViewService.mapView, lineStyle, (geometry) =>
          this.complete(geometry),
        );
        break;
      case 'draw-polygon':
        this.toolStrategy = new EsriPolygonDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => this.complete(geometry),
          'polygon',
        );
        break;
      case 'draw-rectangle':
        this.toolStrategy = new EsriPolygonDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => this.complete(geometry),
          'rectangle',
        );
        break;
      case 'draw-circle':
        this.toolStrategy = new EsriPolygonDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => this.complete(geometry),
          'circle',
        );
        break;
    }
  }
}
