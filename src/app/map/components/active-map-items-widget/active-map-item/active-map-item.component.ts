import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';

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

  public toggleSublayerVisibility(activeMapItem: ActiveMapItem, layerId: number) {
    const sublayer = activeMapItem.layers.find((l) => l.id === layerId);
    if (sublayer) {
      this.store.dispatch(ActiveMapItemActions.setSublayerVisibility({visible: !sublayer.visible, activeMapItem, layerId}));
    }
  }

  public dropSublayer($event: CdkDragDrop<CdkDrag>, activeMapItem: ActiveMapItem) {
    this.store.dispatch(
      ActiveMapItemActions.reorderSublayer({activeMapItem, previousPosition: $event.previousIndex, currentPosition: $event.currentIndex})
    );
  }

  public onOpacitySliderChange(opacity: number, activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem}));
  }

  public displayTransparency(value?: number): string {
    return value === undefined ? '' : `${Math.round(value * 100)}%`;
  }
}
