import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {selectActiveMapItems} from '../../../state/map/reducers/active-map-item.reducer';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItem, Gb2WmsActiveMapItem} from '../../models/active-map-item.model';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteCreationDialogComponent} from '../favourite-creation-dialog/favourite-creation-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MapNoticeDialogComponent} from '../map-notice-dialog/map-notice-dialog.component';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';

const FAVOURITE_HELPER_MESSAGES = {
  noMapsAdded: 'Fügen Sie mindestens 1 Karte hinzu, um einen Favoriten anzulegen.',
  notAuthenticated: 'Loggen Sie sich ein, um Favoriten hinzuzufügen.'
};
const FAVOURITE_CREATION_DIALOG_MAX_WIDTH = 500;
const MAP_NOTICES_DIALOG_MAX_WIDTH = 968;

@Component({
  selector: 'active-map-items',
  templateUrl: './active-map-items.component.html',
  styleUrls: ['./active-map-items.component.scss']
})
export class ActiveMapItemsComponent implements OnInit, OnDestroy {
  public isAuthenticated: boolean = false;
  public activeMapItems: ActiveMapItem[] = [];
  public isMinimized = false;
  public numberOfNotices: number = 0;
  public numberOfUnreadNotices: number = 0;
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;

  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store, private readonly dialogService: MatDialog) {}

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
      ActiveMapItemActions.reorderActiveMapItem({previousPosition: $event.previousIndex, currentPosition: $event.currentIndex})
    );
  }

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public showFavouriteDialog() {
    this.dialogService.open(FavouriteCreationDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      maxWidth: FAVOURITE_CREATION_DIALOG_MAX_WIDTH
    });
  }

  public toggleMinimizeActiveMapItems() {
    this.isMinimized = !this.isMinimized;
  }

  public showMapNotices() {
    this.store.dispatch(ActiveMapItemActions.markAllActiveMapItemNoticeAsRead());
    this.dialogService.open(MapNoticeDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      data: this.activeMapItems.filter(
        (activeMapItem) => activeMapItem.configuration.type === 'gb2Wms' && activeMapItem.configuration.notice
      ), // todo: As soon as more layers with notices come into play, a selector on the interface would be required.
      maxWidth: MAP_NOTICES_DIALOG_MAX_WIDTH
    });
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
            const gb2ActiveMapItems = currentActiveMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.updateNumberOfNotices(gb2ActiveMapItems);
          })
        )
        .subscribe()
    );
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
          })
        )
        .subscribe()
    );
  }

  private updateNumberOfNotices(currentActiveMapItems: Gb2WmsActiveMapItem[]) {
    const activeMapItemsWithNotices = currentActiveMapItems.filter((activeMapItem) => activeMapItem.configuration.notice);
    this.numberOfNotices = activeMapItemsWithNotices.length;
    this.numberOfUnreadNotices = activeMapItemsWithNotices.filter(
      (activeMapItem) => !activeMapItem.configuration.isNoticeMarkedAsRead
    ).length;
  }
}
