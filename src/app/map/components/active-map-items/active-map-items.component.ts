import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {selectActiveTool} from '../../../state/map/reducers/tool.reducer';
import {OnboardingGuideService} from '../../../onboarding-guide/services/onboarding-guide.service';
import {selectItems} from '../../../state/map/selectors/active-map-items.selector';

const FAVOURITE_HELPER_MESSAGES = {
  noMapsAdded: 'Um einen Favoriten anzulegen, muss mindestens eine Karte hinzugefügt werden.',
  notAuthenticated: 'Um aktive Karten als Favorit speichern zu können, muss man angemeldet sein.',
  authenticatedAndMapsAdded: 'Aktive Karten als Favorit speichern',
};

const TOOLTIP_TEXT = {
  onboardingGuide: 'Onboarding-Guide erneut öffnen',
  mapNotices: 'Kartenhinweise zu den aktiven Karten',
  removeAll: 'Alle aktiven Karten entfernen',
};

@Component({
  selector: 'active-map-items',
  templateUrl: './active-map-items.component.html',
  styleUrls: ['./active-map-items.component.scss'],
})
export class ActiveMapItemsComponent implements OnInit, OnDestroy {
  public tooltipText = TOOLTIP_TEXT;
  public isAuthenticated: boolean = false;
  public activeMapItems: ActiveMapItem[] = [];
  public isMinimized = false;
  public numberOfNotices: number = 0;
  public numberOfUnreadNotices: number = 0;
  public screenMode: ScreenMode = 'regular';
  public toolTipsFavourite: string = FAVOURITE_HELPER_MESSAGES.notAuthenticated;
  public isActiveMapItemDragAndDropDisabled: boolean = false;
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;

  private readonly activeMapItems$ = this.store.select(selectItems);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly activeTool$ = this.store.select(selectActiveTool);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly onboardingGuideService: OnboardingGuideService,
  ) {}

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

  public restartOnboardingGuide() {
    this.onboardingGuideService.start();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.activeMapItems$
        .pipe(
          tap((currentActiveMapItems) => {
            this.activeMapItems = currentActiveMapItems;
            const gb2ActiveMapItems = currentActiveMapItems.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem));
            this.updateNumberOfNotices(gb2ActiveMapItems);
            this.updateFavouritesMessage();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;
            this.updateFavouritesMessage();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(
      this.activeTool$.pipe(tap((activeTool) => (this.isActiveMapItemDragAndDropDisabled = !!activeTool))).subscribe(),
    );
  }

  private updateNumberOfNotices(currentActiveMapItems: Gb2WmsActiveMapItem[]) {
    const activeMapItemsWithNotices = currentActiveMapItems.filter((activeMapItem) => activeMapItem.settings.notice);
    this.numberOfNotices = activeMapItemsWithNotices.length;
    this.numberOfUnreadNotices = activeMapItemsWithNotices.filter((activeMapItem) => !activeMapItem.settings.isNoticeMarkedAsRead).length;
  }

  public updateFavouritesMessage(): void {
    if (!this.isAuthenticated) {
      this.toolTipsFavourite = this.favouriteHelperMessages.notAuthenticated;
    } else if (this.activeMapItems.length === 0) {
      this.toolTipsFavourite = this.favouriteHelperMessages.noMapsAdded;
    } else {
      this.toolTipsFavourite = this.favouriteHelperMessages.authenticatedAndMapsAdded;
    }
  }
}
