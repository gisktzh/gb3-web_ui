import {Injectable, OnDestroy} from '@angular/core';
import {NavigationEnd, Router, UrlTree} from '@angular/router';
import {BehaviorSubject, filter, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MainPage} from '../enums/main-page.enum';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {PageNotification} from '../interfaces/page-notification.interface';
import {selectAllUnreadPageNotifications} from '../../state/app/selectors/page-notification.selector';
import {UrlUtils} from '../utils/url.utils';

@Injectable({
  providedIn: 'root',
})
export class PageNotificationService implements OnDestroy {
  public readonly currentPageNotifications$ = new BehaviorSubject<PageNotification[]>([]);

  private readonly pageNotifications$ = this.store.select(selectAllUnreadPageNotifications);
  private readonly subscriptions: Subscription = new Subscription();

  private currentMainPageOrUndefined?: MainPage;
  private pageNotifications: PageNotification[] = [];

  constructor(
    private readonly router: Router,
    private readonly store: Store,
  ) {
    this.store.dispatch(PageNotificationActions.loadPageNotifications());
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    // TODO: this can be replaced with NGRX Router
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          tap((event) => {
            const urlTree: UrlTree = this.router.parseUrl(event.url);
            const firstUrlSegmentPath = UrlUtils.extractFirstUrlSegmentPath(urlTree);
            this.currentMainPageOrUndefined = UrlUtils.transformStringToMainPage(firstUrlSegmentPath);
            this.refreshCurrentPageNotifications(this.currentMainPageOrUndefined, this.pageNotifications);
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.pageNotifications$
        .pipe(
          tap((pageNotifications) => {
            this.pageNotifications = pageNotifications;
            this.refreshCurrentPageNotifications(this.currentMainPageOrUndefined, this.pageNotifications);
          }),
        )
        .subscribe(),
    );
  }

  private refreshCurrentPageNotifications(currentMainPage: MainPage | undefined, pageNotifications: PageNotification[]) {
    let currentPageNotifications: PageNotification[] = [];
    if (currentMainPage !== undefined && pageNotifications.length > 0) {
      currentPageNotifications = pageNotifications.filter((pageNotification) => pageNotification.pages.includes(currentMainPage));
    }
    this.currentPageNotifications$.next(currentPageNotifications);
  }
}
