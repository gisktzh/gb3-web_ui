import {Component, OnDestroy, OnInit} from '@angular/core';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Store} from '@ngrx/store';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {selectActiveMapItems} from '../../../state/map/reducers/active-map-item.reducer';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {MatDialog} from '@angular/material/dialog';
import {FavouriteCreationDialogComponent} from '../favourite-creation-dialog/favourite-creation-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';

const favouriteHelperMessages = {
  noMapsAdded: 'Fügen Sie mindestens 1 Karte hinzu, um einen Favoriten anzulegen.',
  notAuthenticated: 'Loggen Sie sich ein, um Favoriten hinzuzufügen.'
};

@Component({
  selector: 'active-map-items',
  templateUrl: './active-map-items.component.html',
  styleUrls: ['./active-map-items.component.scss']
})
export class ActiveMapItemsComponent implements OnInit, OnDestroy {
  public isAuthenticated: boolean = false;
  public favouriteHelperMessages = favouriteHelperMessages;
  public activeMapItems: ActiveMapItem[] = [];
  private readonly activeMapItems$ = this.store.select(selectActiveMapItems);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly subscription: Subscription = new Subscription();

  constructor(private readonly store: Store, private readonly dialogService: MatDialog) {}

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

  public removeAllActiveMapItems() {
    this.store.dispatch(ActiveMapItemActions.removeAllActiveMapItems());
  }

  public showFavouriteDialog() {
    this.dialogService.open(FavouriteCreationDialogComponent, {
      panelClass: PanelClass.API_WRAPPER_DIALOG,
      restoreFocus: false
    });
  }

  private initSubscriptions() {
    this.subscription.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
          })
        )
        .subscribe()
    );
    this.subscription.add(
      this.isAuthenticated$
        .pipe(
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
          })
        )
        .subscribe()
    );
  }
}
