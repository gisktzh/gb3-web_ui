/*
import {Injectable} from '@angular/core';
import {ToolService} from '../../interfaces/tool.service';
import {EsriMapViewService} from './esri-map-view.service';
import Graphic from '@arcgis/core/Graphic';
import Draw from '@arcgis/core/views/draw/Draw';
import Polyline from '@arcgis/core/geometry/Polyline';

@Injectable({
  providedIn: 'root'
})
export class EsriToolService implements ToolService {

  constructor(private readonly esriMapViewService: EsriMapViewService) { }

  public testDrawing(): void {
    console.log('activating!');
    // create a new instance of draw
    const draw = new Draw({
      view: this.esriMapViewService.mapView
    });

// create an instance of draw polyline action
// the polyline vertices will be only added when
// the pointer is clicked on the view
    const action = draw.create('polyline', {mode: 'hybrid'});

// fires when a vertex is added
    action.on('vertex-add', (evt) => {
      //this.measureLine(evt.vertices);
    });

// fires when the pointer moves
    action.on('cursor-update', (evt) => {
      this.measureLine(evt.vertices);
    });

// fires when the drawing is completed
    action.on('draw-complete', (evt) => {
      //this.measureLine(evt.vertices);
    });

// fires when a vertex is removed
    action.on('vertex-remove', (evt) => {
      //this.measureLine(evt.vertices);
    });


  }

  public measureLine(vertices: any) {
    this.esriMapViewService.mapView.graphics.removeAll();

    const line = this.createLine(vertices);
    const graphic = new Graphic({geometry: line});
    this.esriMapViewService.mapView.graphics.add(graphic);
  }

  public createLine(vertices: any) {
    return new Polyline({
      paths: [vertices], spatialReference: this.esriMapViewService.mapView.spatialReference
    });
  }
}
*/
import {Injectable, OnDestroy} from '@angular/core';
import {ToolService} from '../../interfaces/tool.service';
import {EsriMapViewService} from './esri-map-view.service';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Polyline from '@arcgis/core/geometry/Polyline';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import {selectDrawingLayers} from '../../../state/map/selectors/drawing-layers.selector';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {MeasurementTool} from '../../../state/map/states/tool.state';
import Layer = __esri.Layer;

@Injectable({
  providedIn: 'root'
})
export class EsriToolService implements ToolService, OnDestroy {
  private drawingLayers: ActiveMapItem[] = [];
  private readonly drawingLayers$ = this.store.select(selectDrawingLayers);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly esriMapViewService: EsriMapViewService, private readonly store: Store) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public startMeasurement(measurementType: MeasurementTool): void {
    switch (measurementType) {
      case 'measure-area':
        throw Error('Measure Area not yet implemented!');
      case 'measure-line':
        const drawingLayer = this.esriMapViewService.findEsriLayer('measurement');

        if (!drawingLayer) {
          reactiveUtils.once(() => this.esriMapViewService.findEsriLayer('measurement')).then((layer) => this.startDrawing(layer!));

          const drawingLayerAdd = ActiveMapItemFactory.createDrawingMapItem();
          this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem: drawingLayerAdd, position: 0}));
        } else {
          this.startDrawing(drawingLayer);
        }
        break;
      case 'measure-point':
        throw Error('Measure Point not yet implemented!');
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.drawingLayers$.pipe(tap((drawingLayers) => (this.drawingLayers = drawingLayers))).subscribe());
  }

  private startDrawing(layer: Layer) {
    // todo: strategy pattern :)
    this.forceVisibility();
    const sketch = new SketchViewModel({
      view: this.esriMapViewService.mapView,
      layer: layer,
      tooltipOptions: {enabled: true},
      polylineSymbol: {
        type: 'simple-line',
        color: '#FF0000',
        width: 2
      }
    });

    sketch.create('polyline');
    sketch.on('create', (e) => {
      if (e.state === 'complete') {
        const length = geometryEngine.planarLength(e.graphic.geometry as Polyline, 'meters');
        const txtSymbol = new TextSymbol({
          text: `${length}m`,
          color: '#FF0000',
          verticalAlignment: 'bottom',
          yoffset: -12,
          haloColor: '#FFFFFF',
          haloSize: 2
        });
        const label = new Graphic({
          geometry: (e.graphic.geometry as Polyline).getPoint(0, (e.graphic.geometry as Polyline).paths[0].length - 1),
          symbol: txtSymbol
        });

        (layer as GraphicsLayer).addMany([label]);
        console.log((layer as GraphicsLayer).graphics.length);
      }
    });
  }

  /**
   * Forces the drawing layer to become visible to prevent users from measuring on transparent or invisible drawing layers.
   * @private
   */
  private forceVisibility() {
    // todo: refactor to array
    const activeMapItem = this.drawingLayers.find((l) => l.id === 'measurement')!;
    this.store.dispatch(ActiveMapItemActions.forceFullVisibility({activeMapItem}));
  }
}
