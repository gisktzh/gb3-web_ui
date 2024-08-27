import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {MapConstants} from '../../../../shared/constants/map.constants';

@Component({
  // no selector here as it is a base component
  templateUrl: './base-map-data-item.component.html',
  styleUrls: ['./base-map-data-item.component.scss'],
})
export class BaseMapDataItemComponent {
  @Input() public title!: string;
  @Input() public filterString: string | undefined = undefined;
  /**
   * URL to gb2, if the given mapitem is not yet gb3-capable.
   */
  public gb2Url: string | null = null;
  public mapConfigState?: MapConfigState;
  public isAddItemDisabled: boolean = false;

  @Output() public readonly addEvent = new EventEmitter<void>();
  @Output() public readonly hoverStartEvent = new EventEmitter<MapLayer>();
  @Output() public readonly hoverEndEvent = new EventEmitter<MapLayer>();

  public readonly addLayerEvent = new EventEmitter<MapLayer>();
  public readonly deleteEvent = new EventEmitter<void>();
  public readonly hoverDelay = MapConstants.TEMPORARY_PREVIEW_DELAY;
  public showExpandButton: boolean = true;

  public showDeleteButton: boolean = false;
  public loadingState: LoadingState;
  public invalid?: boolean;
  public errorTooltip: string = '';

  public layers: MapLayer[] = [];
  public imageUrl?: string;

  public isMapHovered: boolean = false;
  public hoveredLayer?: MapLayer;

  public addItem() {
    this.addEvent.emit();
  }

  public hoverStart(layer?: MapLayer) {
    if (!this.gb2Url) {
      if (layer) {
        this.hoveredLayer = layer;
      } else {
        this.isMapHovered = true;
      }
      this.hoverStartEvent.emit(layer);
    }
  }

  public hoverEnd(layer?: MapLayer) {
    if (!this.gb2Url) {
      this.isMapHovered = false;
      this.hoveredLayer = undefined;
      this.hoverEndEvent.emit(layer);
    }
  }

  public deleteItem() {
    this.deleteEvent.emit();
  }

  public addItemLayer(layer: MapLayer) {
    this.addLayerEvent.emit(layer);
  }
}
