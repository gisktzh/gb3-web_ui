import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BaseMapDataItemComponent} from './base-map-data-item.component';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state';

@Component({
  selector: 'map-data-item-map',
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss']
})
export class MapDataItemMapComponent extends BaseMapDataItemComponent {
  @Input() public override layers: MapLayer[] = [];
  @Input() public override imageUrl!: string;

  @Output() public override addLayerEvent = new EventEmitter<MapLayer>();

  public override loadingState: LoadingState = 'loaded';
}
