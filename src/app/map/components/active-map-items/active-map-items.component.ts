import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {selectItems} from '../../../state/map/reducers/active-map-item.reducer';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

const FAVOURITE_HELPER_MESSAGES = {
  noMapsAdded: 'Fügen Sie mindestens 1 Karte hinzu, um einen Favoriten anzulegen.',
  notAuthenticated: 'Loggen Sie sich ein, um Favoriten hinzuzufügen.',
};

@Component({
  selector: 'active-map-items',
  templateUrl: './active-map-items.component.html',
  styleUrls: ['./active-map-items.component.scss'],
})
export class ActiveMapItemsComponent implements OnInit, OnDestroy {
  public isAuthenticated: boolean = false;
  public activeMapItems: ActiveMapItem[] = [];
  public isMinimized = false;
  public numberOfNotices: number = 0;
  public numberOfUnreadNotices: number = 0;
  public screenMode: ScreenMode = 'regular';
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;

  private readonly activeMapItems$ = this.store.select(selectItems);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public trackByMapItemId(index: number, item: ActiveMapItem) {
    return item.id;
  }

  public dropMapItem($event: CdkDragDrop<CdkDrag>) {
    this.store.dispatch(
      ActiveMapItemActions.reorderActiveMapItem({previousPosition: $event.previousIndex, currentPosition: $event.currentIndex}),
    );
  }

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public showFavouriteDialog() {
    this.store.dispatch(MapUiActions.showCreateFavouriteDialog());
  }

  public toggleMinimizeActiveMapItems() {
    this.isMinimized = !this.isMinimized;
  }

  public showMapNotices() {
    this.store.dispatch(MapUiActions.showMapNoticesDialog());
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
            const gb2ActiveMapItems = currentActiveMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.updateNumberOfNotices(gb2ActiveMapItems);
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.screenMode$
        .pipe(
          tap((screenMode) => {
            this.screenMode = screenMode;
          }),
        )
        .subscribe(),
    );
  }

  private updateNumberOfNotices(currentActiveMapItems: Gb2WmsActiveMapItem[]) {
    const activeMapItemsWithNotices = currentActiveMapItems.filter((activeMapItem) => activeMapItem.settings.notice);
    this.numberOfNotices = activeMapItemsWithNotices.length;
    this.numberOfUnreadNotices = activeMapItemsWithNotices.filter((activeMapItem) => !activeMapItem.settings.isNoticeMarkedAsRead).length;
  }
}
