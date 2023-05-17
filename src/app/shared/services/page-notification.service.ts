import {Injectable, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, filter, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {MainPage} from '../enums/main-page.enum';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {PageNotification} from '../interfaces/page-notification.interface';
import {selectAllUnreadPageNotifications} from '../../state/app/selectors/page-notification.selector';

@Injectable({
  providedIn: 'root'
})
export class PageNotificationService implements OnDestroy {
  public readonly currentPageNotifications$ = new BehaviorSubject<PageNotification[]>([]);

  private readonly pageNotifications$ = this.store.select(selectAllUnreadPageNotifications);
  private readonly subscriptions: Subscription = new Subscription();

  private currentMainPageOrUndefined?: MainPage;
  private pageNotifications: PageNotification[] = [];

  constructor(private readonly router: Router, private readonly store: Store) {
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
            this.currentMainPageOrUndefined = this.tryGetCurrentMainPage();
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

  /** Tries to get the first URL path part parsed as enum `MainPage`; Returns `undefined` if either the extraction or parsing failed. */
  private tryGetCurrentMainPage(): MainPage | undefined {
    const currentLocationPathname = this.getCurrentLocationPathname();
    const extractedMainPageString = this.extractMainPageStringFromUrl(currentLocationPathname, 1);
    return this.parseStringToMainPage(extractedMainPageString);
  }

  private getCurrentLocationPathname(): string {
    return location.pathname;
  }

  private extractMainPageStringFromUrl(url: string, partNumber: number): string | undefined {
    const urlPathParts = url.split('/');
    if (urlPathParts.length < partNumber + 1) {
      return undefined;
    }
    return urlPathParts[partNumber];
  }

  private parseStringToMainPage(mainPageString: string | undefined): MainPage | undefined {
    return mainPageString !== undefined && Object.values<string>(MainPage).includes(mainPageString)
      ? (mainPageString as MainPage)
      : undefined;
  }
}
