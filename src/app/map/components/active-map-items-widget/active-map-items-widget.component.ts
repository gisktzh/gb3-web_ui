import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {selectActiveMapItems} from '../../../state/map/reducers/active-map-item.reducer';
import {Subscription} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {LegendActions} from '../../../state/map/actions/legend.actions';
import {slideInOutAnimation} from '../../../shared/animations/slideInOut.animation';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';

const favouriteHelperMessages = {
  noMapsAdded: 'Fügen Sie mindestens 1 Karte hinzu, um einen Favoriten anzulegen.',
  notAuthenticated: 'Loggen Sie sich ein, um Favoriten hinzuzufügen.'
};

@Component({
  selector: 'active-map-items-widget',
  templateUrl: './active-map-items-widget.component.html',
  styleUrls: ['./active-map-items-widget.component.scss'],
  animations: [slideInOutAnimation]
})
export class ActiveMapItemsWidgetComponent implements OnInit, OnDestroy {
  public isAuthenticated: boolean = false;
  public favouriteHelperMessages = favouriteHelperMessages;
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly subscription: Subscription = new Subscription();
  private _activeMapItems: ActiveMapItem[] = [];

  constructor(private readonly store: Store) {}

  public get activeMapItems(): ActiveMapItem[] {
    return this._activeMapItems;
  }

  public ngOnInit() {
    this.initSubscriptions();
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

  public createFavourite() {
    window.alert('Adding favourite!');
  }

  private initSubscriptions() {
    this.subscription.add(
      this.activeMapItems$.subscribe((currentActiveMapItems) => {
        this._activeMapItems = currentActiveMapItems;
      })
    );
    this.subscription.add(
      this.isAuthenticated$.subscribe((isAuthenticated) => {
        this.isAuthenticated = isAuthenticated;
      })
    );
  }
}
