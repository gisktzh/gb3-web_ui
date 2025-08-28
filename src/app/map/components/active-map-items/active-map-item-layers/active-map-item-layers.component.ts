import {Component, Input, inject} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {CdkDrag, CdkDragDrop, CdkDropList, CdkDragHandle, CdkDragPlaceholder} from '@angular/cdk/drag-drop';
import {DragCursorDirective} from '../../../../shared/directives/drag-cursor.directive';
import {ActiveMapItemLayerComponent} from './active-map-item-layer/active-map-item-layer.component';

@Component({
  selector: 'active-map-item-layers',
  templateUrl: './active-map-item-layers.component.html',
  styleUrls: ['./active-map-item-layers.component.scss'],
  imports: [CdkDropList, CdkDrag, DragCursorDirective, ActiveMapItemLayerComponent, CdkDragHandle, CdkDragPlaceholder],
})
export class ActiveMapItemLayersComponent {
  private readonly store = inject(Store);

  @Input() public activeMapItem!: ActiveMapItem;

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
