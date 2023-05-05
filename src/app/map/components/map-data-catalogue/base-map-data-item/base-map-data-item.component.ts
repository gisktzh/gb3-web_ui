import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state';

export type MapDataItemType = 'map' | 'favorite';

@Component({
  // no selector here as it is a base component
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss']
})
export class BaseMapDataItemComponent {
  @Input() public title!: string;
  @Input() public filterString: string = '';

  @Output() public addEvent = new EventEmitter<void>();

  public addLayerEvent = new EventEmitter<MapLayer>();
  public deleteEvent = new EventEmitter<void>();

  public showDeleteButton: boolean = false;
  public loadingState: LoadingState = 'undefined';
  public invalid?: boolean;
  public errorTooltip: string = '';

  public layers: MapLayer[] = [];
  public imageUrl?: string;

  public addItem() {
    this.addEvent.emit();
  }

  public deleteItem() {
    this.deleteEvent.emit();
  }

  public addItemLayer(layer: MapLayer) {
    this.addLayerEvent.emit(layer);
  }
}
