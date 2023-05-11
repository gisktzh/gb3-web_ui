import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';

@Component({
  selector: 'map-data-item-map-layer',
  templateUrl: './map-data-item-map-layer.component.html',
  styleUrls: ['./map-data-item-map-layer.component.scss']
})
export class MapDataItemMapLayerComponent {
  @Input() public layer!: MapLayer;
  @Input() public filterString: string = '';

  @Output() public addLayerEvent = new EventEmitter<void>();

  public addItemLayer() {
    this.addLayerEvent.emit();
  }
}
