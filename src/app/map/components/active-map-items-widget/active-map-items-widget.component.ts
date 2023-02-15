import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {selectActiveMapItems} from '../../../state/map/reducers/active-map-item.reducer';
import {Subscription} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {LegendActions} from '../../../state/map/actions/legend.actions';
import {slideInOutAnimation} from '../../../shared/animations/slideInOut.animation';

@Component({
  selector: 'active-map-items-widget',
  templateUrl: './active-map-items-widget.component.html',
  styleUrls: ['./active-map-items-widget.component.scss'],
  animations: [slideInOutAnimation]
})
export class ActiveMapItemsWidgetComponent implements OnInit, OnDestroy {
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly subscription: Subscription = new Subscription();

  private _activeMapItems: ActiveMapItem[] = [];

  constructor(private readonly store: Store) {}

  public get activeMapItems(): ActiveMapItem[] {
    return this._activeMapItems;
  }

  public ngOnInit() {
    this.subscription.add(
      this.activeMapItems$.subscribe((currentActiveMapItems) => {
        this._activeMapItems = currentActiveMapItems;
      })
    );
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public trackByMapItemId(index: number, item: ActiveMapItem) {
    return item.id;
  }

  public dropMapItem($event: CdkDragDrop<CdkDrag>) {
    this.store.dispatch(
      ActiveMapItemActions.reorderActiveMapItem({previousPosition: $event.previousIndex, currentPosition: $event.currentIndex})
    );
  }

  public removeActiveMapItem(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.removeActiveMapItem(activeMapItem));
  }

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public toggleMapItemVisibility(activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.setVisibility({visible: !activeMapItem.visible, activeMapItem}));
  }

  public toggleLegend() {
    this.store.dispatch(LegendActions.showLegend());
  }
}
