import {Injectable, OnDestroy, inject} from '@angular/core';
import {BehaviorSubject, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MainPage} from '../enums/main-page.enum';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {PageNotification} from '../interfaces/page-notification.interface';
import {selectAllUnreadPageNotifications} from '../../state/app/selectors/page-notification.selector';
import {selectMainPage} from '../../state/app/reducers/url.reducer';

@Injectable({
  providedIn: 'root',
})
export class PageNotificationService implements OnDestroy {
  private readonly store = inject(Store);

  public readonly currentPageNotifications$ = new BehaviorSubject<PageNotification[]>([]);

  private mainPage: MainPage | undefined;
  private pageNotifications: PageNotification[] = [];

  private readonly mainPage$ = this.store.select(selectMainPage);
  private readonly pageNotifications$ = this.store.select(selectAllUnreadPageNotifications);
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.store.dispatch(PageNotificationActions.loadPageNotifications());
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.mainPage$
        .pipe(
          tap((mainPage) => {
            this.mainPage = mainPage;
            this.refreshCurrentPageNotifications();
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.pageNotifications$
        .pipe(
          tap((pageNotifications) => {
            this.pageNotifications = pageNotifications;
            this.refreshCurrentPageNotifications();
          }),
        )
        .subscribe(),
    );
  }

  private refreshCurrentPageNotifications() {
    let currentPageNotifications: PageNotification[] = [];
    if (this.mainPage !== undefined && this.pageNotifications.length > 0) {
      currentPageNotifications = this.pageNotifications.filter((pageNotification) => pageNotification.pages.includes(this.mainPage!));
    }
    this.currentPageNotifications$.next(currentPageNotifications);
  }
}
