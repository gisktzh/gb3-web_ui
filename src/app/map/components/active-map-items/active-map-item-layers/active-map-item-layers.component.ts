import {Component, Input} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';

@Component({
  selector: 'active-map-item-layers',
  templateUrl: './active-map-item-layers.component.html',
  styleUrls: ['./active-map-item-layers.component.scss'],
})
export class ActiveMapItemLayersComponent {
  @Input() public activeMapItem!: ActiveMapItem;

  constructor(private readonly store: Store) {}

  public trackByLayerId(index: number, item: MapLayer) {
    return item.id;
  }

  public dropSublayer($event: CdkDragDrop<CdkDrag>) {
    this.store.dispatch(
      ActiveMapItemActions.reorderSublayer({
        activeMapItem: this.activeMapItem,
        previousPosition: $event.previousIndex,
        currentPosition: $event.currentIndex,
      }),
    );
  }
}
