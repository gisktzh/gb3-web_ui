import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MapService} from '../../services/map.service';
import {EsriLayerList, EsriSlider} from '../../../shared/external/esri.module';

@Component({
  selector: 'layer-widget',
  templateUrl: './layer-widget.component.html',
  styleUrls: ['./layer-widget.component.scss']
})
export class LayerWidgetComponent implements OnInit {
  @ViewChild('layerWidget', {static: true}) layerWidgetRef!: ElementRef;

  constructor(private readonly mapService: MapService) {}

  public ngOnInit() {
    const mapView = this.mapService.mapView;
    const layerListProperties: __esri.LayerListProperties = {
      view: mapView,
      container: this.layerWidgetRef.nativeElement,
      listItemCreatedFunction: (e) => this.listItemCreatedFunction(e)
    };
    const layerList = new EsriLayerList(layerListProperties);
    mapView.ui.add(layerList);
  }

  private listItemCreatedFunction(event: unknown): void {
    const item = (<{item: __esri.ListItem}>event).item;
    if (!item.parent) {
      const slider = new EsriSlider({
        min: 0,
        max: 1,
        precision: 2,
        values: [1],
        visibleElements: {
          labels: true,
          rangeLabels: true
        }
      });
      // @ts-ignore WIP and therefore ignored
      item.panel = {
        content: slider,
        className: 'esri-icon-sliders-horizontal',
        title: 'Change layer opacity'
      };

      slider.on('thumb-drag', (sliderEvent: __esri.SliderThumbDragEvent) => {
        item.layer.opacity = sliderEvent.value;
      });
    }
  }
}
