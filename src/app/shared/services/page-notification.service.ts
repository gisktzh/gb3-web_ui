import {Injectable, computed, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {PageNotification} from '../interfaces/page-notification.interface';
import {selectAllUnreadPageNotifications} from '../../state/app/selectors/page-notification.selector';
import {selectMainPage} from '../../state/app/reducers/url.reducer';

@Injectable({
  providedIn: 'root',
})
export class PageNotificationService {
  private readonly store = inject(Store);
  private readonly mainPage = this.store.selectSignal(selectMainPage);
  private readonly pageNotifications = this.store.selectSignal(selectAllUnreadPageNotifications);
  public readonly currentPageNotifications = computed<PageNotification[]>(() => {
    const mainPage = this.mainPage();

    if (!mainPage) {
      return [];
    }

    return this.pageNotifications().filter((pageNotification) => pageNotification.pages.includes(mainPage));
  });

  constructor() {
    this.store.dispatch(PageNotificationActions.loadPageNotifications());
  }
}
