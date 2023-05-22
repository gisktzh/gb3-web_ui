import {Inject, Injectable, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, filter, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MainPage} from '../enums/main-page.enum';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {PageNotification} from '../interfaces/page-notification.interface';
import {selectAllUnreadPageNotifications} from '../../state/app/selectors/page-notification.selector';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PageNotificationService implements OnDestroy {
  public readonly currentPageNotifications$ = new BehaviorSubject<PageNotification[]>([]);

  private readonly pageNotifications$ = this.store.select(selectAllUnreadPageNotifications);
  private readonly subscriptions: Subscription = new Subscription();

  private currentMainPageOrUndefined?: MainPage;
  private pageNotifications: PageNotification[] = [];

  constructor(private readonly router: Router, private readonly store: Store, @Inject(DOCUMENT) private readonly document: Document) {
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
          tap(() => {
            this.currentMainPageOrUndefined = this.getCurrentMainPage();
            this.refreshCurrentPageNotifications();
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.pageNotifications$
        .pipe(
          tap((pageNotifications) => {
            this.pageNotifications = pageNotifications;
            this.refreshCurrentPageNotifications();
          })
        )
        .subscribe()
    );

    // load the page notifications once
    this.store.dispatch(PageNotificationActions.loadPageNotifications());
  }

  private refreshCurrentPageNotifications() {
    let currentPageNotifications: PageNotification[] = [];
    if (this.currentMainPageOrUndefined !== undefined && this.pageNotifications.length > 0) {
      const currentMainPage = this.currentMainPageOrUndefined;
      currentPageNotifications = this.pageNotifications.filter((pageNotification) => pageNotification.pages.includes(currentMainPage));
    }
    this.currentPageNotifications$.next(currentPageNotifications);
  }

  /**
   * Returns the first URL path part parsed as enum `MainPage` or `undefined` if either the extraction or parsing failed.
   * @private
   */
  private getCurrentMainPage(): MainPage | undefined {
    const currentLocationPathname = this.document.location.pathname;
    const extractedMainPageString = this.extractMainPageStringFromUrl(currentLocationPathname);
    return this.transformStringToMainPage(extractedMainPageString);
  }

  private extractMainPageStringFromUrl(url: string): string | undefined {
    const urlPathParts = url.split('/');
    return urlPathParts.length > 1 ? urlPathParts[1] : undefined;
  }

  private transformStringToMainPage(mainPageString: string | undefined): MainPage | undefined {
    return mainPageString !== undefined && Object.values<string>(MainPage).includes(mainPageString)
      ? (mainPageString as MainPage)
      : undefined;
  }
}
