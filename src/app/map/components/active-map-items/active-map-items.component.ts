import {CdkDrag, CdkDragDrop, CdkDropList, CdkDragHandle, CdkDragPlaceholder} from '@angular/cdk/drag-drop';
import {Component, computed, inject, signal} from '@angular/core';
import {Store} from '@ngrx/store';
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
import {MatCard, MatCardHeader} from '@angular/material/card';
import {TypedTourAnchorDirective} from '../../../shared/directives/typed-tour-anchor.directive';

import {MatBadge} from '@angular/material/badge';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {NotificationIndicatorComponent} from '../notification-indicator/notification-indicator.component';
import {MatAccordion} from '@angular/material/expansion';
import {ActiveMapItemComponent} from './active-map-item/active-map-item.component';
import {DragCursorDirective} from '../../../shared/directives/drag-cursor.directive';
import {CdkScrollable} from '@angular/cdk/scrolling';

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
  imports: [
    MatCard,
    TypedTourAnchorDirective,
    MatCardHeader,
    MatBadge,
    MatIconButton,
    MatTooltip,
    MatIcon,
    MatDivider,
    NotificationIndicatorComponent,
    MatAccordion,
    CdkDropList,
    CdkScrollable,
    ActiveMapItemComponent,
    CdkDrag,
    DragCursorDirective,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
})
export class ActiveMapItemsComponent {
  private readonly store = inject(Store);
  private readonly onboardingGuideService = inject(OnboardingGuideService);

  public tooltipText = TOOLTIP_TEXT;
  public readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  public readonly activeMapItems = this.store.selectSignal(selectItems);
  public readonly isMinimized = signal(false);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly activeTool = this.store.selectSignal(selectActiveTool);
  public readonly toolTipsFavourite = computed(() => {
    if (!this.isAuthenticated()) {
      return this.favouriteHelperMessages.notAuthenticated;
    } else if (this.activeMapItems().length === 0) {
      return this.favouriteHelperMessages.noMapsAdded;
    }

    return this.favouriteHelperMessages.authenticatedAndMapsAdded;
  });
  public readonly isActiveMapItemDragAndDropDisabled = computed(() => !!this.activeTool());
  public readonly favouriteHelperMessages = FAVOURITE_HELPER_MESSAGES;
  public readonly gb2ActiveMapItems = computed<Gb2WmsActiveMapItem[]>(() =>
    this.activeMapItems().filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)),
  );
  public readonly activeMapItemsWithNotices = computed(() =>
    this.gb2ActiveMapItems().filter((activeMapItem) => activeMapItem.settings.notice),
  );

  public readonly numberOfNotices = computed(() => this.activeMapItemsWithNotices().length);
  public readonly numberOfUnreadNotices = computed(
    () => this.activeMapItemsWithNotices().filter((activeMapItem) => !activeMapItem.settings.isNoticeMarkedAsRead).length,
  );

  public trackByMapItemId(_: number, item: ActiveMapItem) {
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

  public showMapNotices() {
    this.store.dispatch(MapUiActions.showMapNoticesDialog());
  }

  public restartOnboardingGuide() {
    this.onboardingGuideService.start();
  }
}
