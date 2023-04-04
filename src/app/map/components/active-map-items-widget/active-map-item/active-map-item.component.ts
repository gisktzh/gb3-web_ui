import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {TimeExtent} from '../../../interfaces/time-extent.interface';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss']
})
export class ActiveMapItemComponent implements OnInit {
  @Input() public activeMapItem!: ActiveMapItem;

  public currentOpacity: number = 0;

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.currentOpacity = this.activeMapItem.opacity;
  }

  public trackByLayerId(index: number, item: MapLayer) {
    return item.id;
  }

  public toggleSublayerVisibility(layer: MapLayer) {
    this.store.dispatch(
      ActiveMapItemActions.setSublayerVisibility({visible: !layer.visible, activeMapItem: this.activeMapItem, layerId: layer.id})
    );
  }

  public dropSublayer($event: CdkDragDrop<CdkDrag>) {
    this.store.dispatch(
      ActiveMapItemActions.reorderSublayer({
        activeMapItem: this.activeMapItem,
        previousPosition: $event.previousIndex,
        currentPosition: $event.currentIndex
      })
    );
  }

  public onOpacitySliderChange(opacity: number) {
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem: this.activeMapItem}));
  }

  public onTimeSliderExtentChange(timeExtent: TimeExtent) {
    this.store.dispatch(ActiveMapItemActions.setTimeSliderExtent({timeExtent, activeMapItem: this.activeMapItem}));
  }

  public displayTransparency(value?: number): string {
    return value === undefined ? '' : `${Math.round(value * 100)}%`;
  }
}
