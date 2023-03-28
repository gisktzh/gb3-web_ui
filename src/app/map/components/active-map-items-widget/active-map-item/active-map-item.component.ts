import {Component, Input} from '@angular/core';
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
export class ActiveMapItemComponent {
  @Input() public activeMapItem!: ActiveMapItem;

  constructor(private readonly store: Store) {}

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
}
