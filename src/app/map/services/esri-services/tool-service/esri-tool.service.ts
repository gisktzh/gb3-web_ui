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
import {InternalDrawingLayer, UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
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
import Graphic from '@arcgis/core/Graphic';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {DrawingActions} from '../../../../state/map/actions/drawing.actions';
import {silentArcgisToGeoJSON} from '../../../../shared/utils/esri-transformer-wrapper.utils';
import {DrawingLayerNotInitialized, UnsupportedGeometryType} from '../errors/esri.errors';
import {DataDownloadSelectionTool} from '../../../../shared/types/data-download-selection-tool.type';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {DataDownloadSelection} from '../../../../shared/interfaces/data-download-selection.interface';
import {EsriPolygonSelectionStrategy} from './strategies/selection/esri-polygon-selection.strategy';
import {AbstractEsriDrawableToolStrategy} from './strategies/abstract-esri-drawable-tool.strategy';
import {EsriMunicipalitySelectionStrategy} from './strategies/selection/esri-municipality-selection.strategy';
import {MatDialog} from '@angular/material/dialog';
import {EsriCantonSelectionStrategy} from './strategies/selection/esri-canton-selection.strategy';
import {EsriScreenExtentSelectionStrategy} from './strategies/selection/esri-screen-extent-selection.strategy';
import {SelectionCallbackHandler} from './interfaces/selection-callback-handler.interface';
import {GeometryWithSrs} from '../../../../shared/interfaces/geojson-types-with-srs.interface';
import Geometry from '@arcgis/core/geometry/Geometry';
import {geojsonToArcGIS} from '@terraformer/arcgis';
import Point from '@arcgis/core/geometry/Point';
import Multipoint from '@arcgis/core/geometry/Multipoint';
import Polyline from '@arcgis/core/geometry/Polyline';
import Polygon from '@arcgis/core/geometry/Polygon';
import {EsriTextDrawingStrategy} from './strategies/drawing/esri-text-drawing.strategy';
import {Gb3GeoshopMunicipalitiesService} from '../../../../shared/services/apis/gb3/gb3-geoshop-municipalities.service';
import {selectCanton} from '../../../../state/map/reducers/data-download-region.reducer';
import {EsriElevationProfileMeasurementStrategy} from './strategies/measurement/esri-elevation-profile-measurement.strategy';
import {ElevationProfileActions} from '../../../../state/map/actions/elevation-profile.actions';

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
    private readonly dialogService: MatDialog,
    private readonly geoshopMunicipalitiesService: Gb3GeoshopMunicipalitiesService,
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
    this.initializeUserDrawingTool(UserDrawingLayer.Drawings, (layer) => this.setDrawingStrategy(drawingTool, layer));
  }

  public initializeMeasurement(measurementTool: Exclude<MeasurementTool, 'measure-elevation-profile'>) {
    this.initializeUserDrawingTool(UserDrawingLayer.Measurements, (layer) => this.setMeasurementStrategy(measurementTool, layer));
  }

  public initializeElevationProfileMeasurement() {
    this.initializeInternalDrawingTool(InternalDrawingLayer.ElevationProfile, (layer) =>
      this.setMeasurementStrategy('measure-elevation-profile', layer),
    );
  }

  public initializeDataDownloadSelection(selectionTool: DataDownloadSelectionTool) {
    this.initializeInternalDrawingTool(InternalDrawingLayer.Selection, (layer) =>
      this.setDataDownloadSelectionStrategy(selectionTool, layer),
    );
  }

  public completeDrawing(graphic: Graphic, labelText?: string) {
    const internalDrawingRepresentation = this.convertToGeoJson(graphic, labelText);
    this.store.dispatch(DrawingActions.addDrawing({drawing: internalDrawingRepresentation}));
    this.endDrawing();
  }
  public completeMeasurement(graphic: Graphic, labelPoint: Graphic, labelText: string) {
    const internalDrawingRepresentation = this.convertToGeoJson(graphic);
    const internalDrawingRepresentationLabel = this.convertToGeoJson(labelPoint, labelText);

    // note: order is important as the features are drawn in the order of the array, starting at the bottom
    this.store.dispatch(DrawingActions.addDrawings({drawings: [internalDrawingRepresentation, internalDrawingRepresentationLabel]}));
    this.endDrawing();
  }

  public addExistingDrawingsToLayer(drawingsToAdd: Gb3StyledInternalDrawingRepresentation[], layerIdentifier: UserDrawingLayer) {
    const fullLayerIdentifier = this.configService.mapConfig.userDrawingLayerPrefix + layerIdentifier;
    const drawingLayer = this.esriMapViewService.findEsriLayer(fullLayerIdentifier);

    if (drawingLayer) {
      const graphics = drawingsToAdd.flatMap((drawing) => this.createGraphicsForDrawing(drawing));
      (drawingLayer as GraphicsLayer).addMany(graphics);
    } else {
      throw new DrawingLayerNotInitialized();
    }
  }

  /**
   * Initializes a given tool by setting the given strategy and starting to draw.
   * @param layer The (Esri) layer that will be used for the drawing part.
   * @param strategySetter A setter function that takes a given layer and sets a strategy for the given tool.
   */
  private initializeTool(layer: GraphicsLayer, strategySetter: (layer: GraphicsLayer) => void) {
    strategySetter(layer);
    this.startDrawing();
  }

  /**
   * Initializes a given internal drawing tool by handling the addition and/or visibility setting ot the drawing layer and uses the
   * supplied setter function to set the correct toolStrategy.
   * @param layerIdentifier Layer name within the map that should be used as identifier
   * @param strategySetter A setter function that takes a given layer and sets a strategy for the given tool.
   */
  private initializeInternalDrawingTool(layerIdentifier: InternalDrawingLayer, strategySetter: (layer: GraphicsLayer) => void) {
    const fullLayerIdentifier = `${this.configService.mapConfig.internalLayerPrefix}${layerIdentifier}`;
    const drawingLayer = this.esriMapViewService.findEsriLayer(fullLayerIdentifier);
    if (drawingLayer) {
      this.initializeTool(drawingLayer as GraphicsLayer, strategySetter);
    }
  }

  /**
   * Initializes a given user drawing tool by handling the addition and/or visibility setting ot the drawing layer and uses the supplied
   * setter function to set the correct toolStrategy.
   * @param layerIdentifier Layer name within the map that should be used as identifier
   * @param strategySetter A setter function that takes a given layer and sets a strategy for the given tool.
   */
  private initializeUserDrawingTool(layerIdentifier: UserDrawingLayer, strategySetter: (layer: GraphicsLayer) => void) {
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
          this.initializeTool(layer! as GraphicsLayer, strategySetter);
        });

      const drawingLayerAdd = ActiveMapItemFactory.createDrawingMapItem(
        layerIdentifier,
        this.configService.mapConfig.userDrawingLayerPrefix,
      );
      this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: drawingLayerAdd, position: 0}));
    } else {
      this.forceVisibility(fullLayerIdentifier);
      this.initializeTool(drawingLayer as GraphicsLayer, strategySetter);
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.drawingLayers$.pipe(tap((drawingLayers) => (this.drawingLayers = drawingLayers))).subscribe());
  }

  private startDrawing() {
    this.registerEscapeEventHandler();
    this.toolStrategy.start();
  }

  private convertToGeoJson(graphic: Graphic, labelText?: string): Gb3StyledInternalDrawingRepresentation {
    const geoJsonFeature = silentArcgisToGeoJSON(graphic.geometry);

    if (geoJsonFeature.type === 'MultiLineString' || geoJsonFeature.type === 'GeometryCollection') {
      throw new UnsupportedGeometryType(geoJsonFeature.type);
    }

    return {
      type: 'Feature',
      geometry: {...geoJsonFeature, srs: this.configService.mapConfig.defaultMapConfig.srsId},
      properties: {
        style: this.esriSymbolizationService.extractGb3SymbolizationFromSymbol(graphic.symbol),
        [AbstractEsriDrawableToolStrategy.identifierFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.identifierFieldName],
        [AbstractEsriDrawableToolStrategy.belongsToFieldName]: graphic.attributes[AbstractEsriDrawableToolStrategy.belongsToFieldName],
      },
      source: this.toolStrategy.internalLayerType,
      labelText,
    };
  }

  private endDrawing() {
    this.esriMapViewService.mapView.removeHandles(HANDLE_GROUP_KEY);
    this.store.dispatch(ToolActions.deactivateTool());
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
    const pointStyle = this.esriSymbolizationService.createPointSymbolization(UserDrawingLayer.Measurements, false) as SimpleMarkerSymbol;
    const lineStyle = this.esriSymbolizationService.createLineSymbolization(UserDrawingLayer.Measurements, false);
    const areaStyle = this.esriSymbolizationService.createPolygonSymbolization(UserDrawingLayer.Measurements, false);
    const labelStyle = this.esriSymbolizationService.createTextSymbolization(UserDrawingLayer.Measurements, false);

    switch (measurementType) {
      case 'measure-area':
        this.toolStrategy = new EsriAreaMeasurementStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          labelStyle,
          (geometry, label, labelText) => this.completeMeasurement(geometry, label, labelText),
        );
        break;
      case 'measure-line':
        this.toolStrategy = new EsriLineMeasurementStrategy(
          layer,
          this.esriMapViewService.mapView,
          lineStyle,
          labelStyle,
          (geometry, label, labelText) => this.completeMeasurement(geometry, label, labelText),
        );
        break;
      case 'measure-point':
        this.toolStrategy = new EsriPointMeasurementStrategy(
          layer,
          this.esriMapViewService.mapView,
          pointStyle,
          labelStyle,
          (geometry, label, labelText) => this.completeMeasurement(geometry, label, labelText),
        );
        break;
      case 'measure-elevation-profile':
        this.toolStrategy = new EsriElevationProfileMeasurementStrategy(layer, this.esriMapViewService.mapView, lineStyle, (geometry) => {
          this.store.dispatch(ElevationProfileActions.loadProfile({geometry: silentArcgisToGeoJSON(geometry.geometry)}));
          this.endDrawing();
        });
        break;
    }
  }

  private setDrawingStrategy(drawingType: DrawingTool, layer: GraphicsLayer) {
    const pointStyle = this.esriSymbolizationService.createPointSymbolization(UserDrawingLayer.Drawings, true) as SimpleMarkerSymbol;
    const textStyle = this.esriSymbolizationService.createTextSymbolization(UserDrawingLayer.Drawings, true);
    const lineStyle = this.esriSymbolizationService.createLineSymbolization(UserDrawingLayer.Drawings, true);
    const areaStyle = this.esriSymbolizationService.createPolygonSymbolization(UserDrawingLayer.Drawings, true);

    switch (drawingType) {
      case 'draw-point':
        this.toolStrategy = new EsriPointDrawingStrategy(layer, this.esriMapViewService.mapView, pointStyle, (geometry) =>
          this.completeDrawing(geometry),
        );
        break;
      case 'draw-line':
        this.toolStrategy = new EsriLineDrawingStrategy(layer, this.esriMapViewService.mapView, lineStyle, (geometry) =>
          this.completeDrawing(geometry),
        );
        break;
      case 'draw-polygon':
        this.toolStrategy = new EsriPolygonDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => this.completeDrawing(geometry),
          'polygon',
        );
        break;
      case 'draw-rectangle':
        this.toolStrategy = new EsriPolygonDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => this.completeDrawing(geometry),
          'rectangle',
        );
        break;
      case 'draw-circle':
        this.toolStrategy = new EsriPolygonDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => this.completeDrawing(geometry),
          'circle',
        );
        break;
      case 'draw-text':
        this.toolStrategy = new EsriTextDrawingStrategy(
          layer,
          this.esriMapViewService.mapView,
          textStyle,
          (geometry, labelText) => this.completeDrawing(geometry, labelText),
          this.dialogService,
        );
        break;
    }
  }

  private setDataDownloadSelectionStrategy(selectionType: DataDownloadSelectionTool, layer: GraphicsLayer) {
    const areaStyle = this.esriSymbolizationService.createPolygonSymbolization(InternalDrawingLayer.Selection, false);

    // todo GB3-826: these should be refactored and added to `DrawingCallbackHandler` as well; and they can then be used in our Strategies'
    //  generics.
    const completeDrawingCallbackHandler: DrawingCallbackHandler['completeDrawing'] = (graphic: Graphic, labelText?: string) => {
      const internalDrawingRepresentation = this.convertToGeoJson(graphic, labelText);
      const selection: DataDownloadSelection = {
        type: selectionType as Exclude<DataDownloadSelectionTool, 'select-municipality'>,
        drawingRepresentation: internalDrawingRepresentation,
      };
      this.store.dispatch(DataDownloadOrderActions.setSelection({selection}));
    };

    const completeSelectionCallbackHandler: SelectionCallbackHandler = {
      complete: (selection: DataDownloadSelection) => {
        this.store.dispatch(DataDownloadOrderActions.setSelection({selection}));
      },
      abort: () => {
        this.store.dispatch(ToolActions.cancelTool());
      },
    };

    switch (selectionType) {
      case 'select-circle':
        this.toolStrategy = new EsriPolygonSelectionStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => completeDrawingCallbackHandler(geometry),
          'circle',
        );
        break;
      case 'select-polygon':
        this.toolStrategy = new EsriPolygonSelectionStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => completeDrawingCallbackHandler(geometry),
          'polygon',
        );
        break;
      case 'select-rectangle':
        this.toolStrategy = new EsriPolygonSelectionStrategy(
          layer,
          this.esriMapViewService.mapView,
          areaStyle,
          (geometry) => completeDrawingCallbackHandler(geometry),
          'rectangle',
        );
        break;
      case 'select-section':
        this.toolStrategy = new EsriScreenExtentSelectionStrategy(
          layer,
          areaStyle,
          completeSelectionCallbackHandler,
          this.esriMapViewService.mapView.extent,
        );
        break;
      case 'select-canton':
        this.toolStrategy = new EsriCantonSelectionStrategy(
          layer,
          areaStyle,
          completeSelectionCallbackHandler,
          this.store.select(selectCanton),
          this.configService,
        );
        break;
      case 'select-municipality':
        this.toolStrategy = new EsriMunicipalitySelectionStrategy(
          layer,
          areaStyle,
          completeSelectionCallbackHandler,
          this.dialogService,
          this.configService,
          this.geoshopMunicipalitiesService,
        );
        break;
    }
  }

  /**
   * Terraformer.geojsonToArcGIS() does return a Geometry instance, yet it misses the type property. This will then fail if injected
   * directly into a new Graphic() object, since it cannot be autocast when missing the type. This Method here extracts the ArcGIS JSON
   * format and returns a properly typed object, while also setting the correct SRS.
   * @param geometry The geoJSON geometry that needs to be transformed
   */
  private convertGeoJsonToArcGIS(geometry: GeometryWithSrs): Geometry {
    const arcGisJsonRepresentation = geojsonToArcGIS(geometry);
    switch (geometry.type) {
      case 'Point':
        return new Point({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'MultiPoint':
        return new Multipoint({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'LineString':
      case 'MultiLineString':
        return new Polyline({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'Polygon':
      case 'MultiPolygon':
        return new Polygon({...arcGisJsonRepresentation, spatialReference: {wkid: geometry.srs}});
      case 'GeometryCollection':
        throw new UnsupportedGeometryType(geometry.type);
    }
  }

  private createGraphicsForDrawing(drawing: Gb3StyledInternalDrawingRepresentation) {
    const symbolization = this.esriSymbolizationService.extractSymbolFromGb3Representation(drawing.properties.style, drawing.labelText);

    const graphics: Graphic[] = [];

    const geometry = this.convertGeoJsonToArcGIS(drawing.geometry);
    const graphic = new Graphic({geometry: geometry, symbol: symbolization});
    graphics.push(graphic);

    return graphics;
  }
}
