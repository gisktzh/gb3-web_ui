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
  constructor(public readonly mapService: MapService) {}

  public get layerViews(): __esri.Collection<__esri.LayerView> {
    return this.mapService.mapView.layerViews;
  }

  public getSubLayers(layer: __esri.Layer): __esri.Collection<__esri.Layer> {
    const groupLayer = layer as __esri.GroupLayer;
    return groupLayer ? groupLayer.layers : new Collection<__esri.Layer>();
  }

  public drop($event: CdkDragDrop<any>) {
    this.layerViews.reorder(this.layerViews.getItemAt($event.previousIndex), $event.currentIndex);
  }

  public onOpacitySliderChange($event: MatSliderChange, layerView: __esri.LayerView) {
    layerView.layer.opacity = $event.value ?? 0;
  }

  public removeLayer(layer: __esri.Layer) {
    this.mapService.mapView.map.layers.remove(layer);
  }

  public toggleLayerVisibility(layerView: __esri.LayerView) {
    layerView.visible = !layerView.visible;
  }

  public toggleSubLayerVisibility(subLayer: __esri.Layer, parentLayer: __esri.Layer) {
    if (parentLayer.visible) {
      // only allow toggle if parent is visible
      subLayer.visible = !subLayer.visible;
    }
  }
}
