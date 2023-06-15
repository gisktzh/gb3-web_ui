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
import {Injectable} from '@angular/core';
import {ToolService} from '../../interfaces/tool.service';
import {EsriMapViewService} from './esri-map-view.service';
import SketchViewModel from '@arcgis/core/widgets/Sketch/SketchViewModel';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import TextSymbol from '@arcgis/core/symbols/TextSymbol';
import Polyline from '@arcgis/core/geometry/Polyline';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';

@Injectable({
  providedIn: 'root'
})
export class EsriToolService implements ToolService {
  constructor(private readonly esriMapViewService: EsriMapViewService) {}

  public testDrawing(): void {
    console.log('activating!');
    // create a new instance of draw
    const layer = new GraphicsLayer();
    this.esriMapViewService.mapView.map.layers.add(layer, 0);

    const sketch = new SketchViewModel({
      view: this.esriMapViewService.mapView,
      layer: new GraphicsLayer(),
      tooltipOptions: {enabled: true},
      polylineSymbol: {
        type: 'simple-line',
        color: '#FF0000'
      }
    });

    sketch.create('polyline');
    sketch.on('create', (e) => {
      if (e.state === 'complete') {
        const length = geometryEngine.planarLength(e.graphic.geometry as Polyline, 'meters');
        const txtSymbol = new TextSymbol({text: `${length}m`});
        const label = new Graphic({geometry: (e.graphic.geometry as Polyline).getPoint(0, 0), symbol: txtSymbol});

        layer.addMany([e.graphic, label]);
        console.log('added!');
      }
    });
  }
}
