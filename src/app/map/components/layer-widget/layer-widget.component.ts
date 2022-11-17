import {Component} from '@angular/core';
import {MapService} from '../../services/map.service';
import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {MatSliderChange} from '@angular/material/slider';
import Collection from '@arcgis/core/core/Collection';

@Component({
  selector: 'layer-widget',
  templateUrl: './layer-widget.component.html',
  styleUrls: ['./layer-widget.component.scss']
})
export class LayerWidgetComponent {
  public get mapViewUpdating(): boolean {
    return this.mapService.mapView.updating;
  }

  public get layers(): __esri.Collection<__esri.Layer> {
    return this.mapService.mapView.map.layers;
  }

  public getSubLayers(layer: __esri.Layer): __esri.Collection<__esri.Layer> {
    const groupLayer = layer as __esri.GroupLayer;
    return groupLayer ? groupLayer.layers : new Collection<__esri.Layer>();
  }

  constructor(public readonly mapService: MapService) {}

  public drop(event: CdkDragDrop<{title: string; poster: string}[]>) {
    this.layers.reorder(this.layers.getItemAt(event.previousIndex), event.currentIndex);
  }

  public onOpacitySliderChange($event: MatSliderChange, layer: __esri.Layer) {
    layer.opacity = $event.value ?? 0;
  }

  public removeLayer(layer: __esri.Layer) {
    this.layers.remove(layer);
  }

  public toggleLayerVisibility(layer: __esri.Layer) {
    layer.visible = !layer.visible;
  }
}
