import {Injectable, OnDestroy} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {BehaviorSubject, filter, Observable, share, Subscription, tap, timer} from 'rxjs';
import {ConfigService} from './config.service';
import {Store} from '@ngrx/store';
import {MainPage} from '../enums/main-page.enum';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {PageNotification} from '../interfaces/page-notification.interface';
import {selectAllPageNotifications} from '../../state/app/selectors/page-notification.selector';
import {AppConstants} from '../constants/app.constants';

@Injectable({
  providedIn: 'root'
})
export class PageNotificationService implements OnDestroy {
  public readonly currentPageNotifications$ = new BehaviorSubject<PageNotification[]>([]);

  private readonly pageNotifications$ = this.store.select(selectAllPageNotifications);
  private readonly subscriptions: Subscription = new Subscription();

  private currentMainUrlPathElement?: MainPage;
  private pageNotifications: PageNotification[] = [];

  constructor(private readonly router: Router, private readonly configService: ConfigService, private readonly store: Store) {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd), // TODO: NGRX Router
          tap(() => {
            const firstUrlPathElement = this.getCurrentFirstUrlPathElement();
            this.currentMainUrlPathElement = this.transformFirstUrlPathElement(firstUrlPathElement);
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

    this.subscriptions.add(this.createPageNotificationPolling(AppConstants.PAGE_NOTIFICATION_POLLING_TIME_IN_SECONDS * 1000).subscribe());
  }

  private refreshCurrentPageNotifications() {
    let currentPageNotifications: PageNotification[] = [];
    if (this.currentMainUrlPathElement !== undefined && Object.keys(this.pageNotifications).length > 0) {
      const currentMainUrlPathElement = this.currentMainUrlPathElement;
      currentPageNotifications = Object.values(this.pageNotifications).filter((pageNotification) =>
        pageNotification.pages.includes(currentMainUrlPathElement)
      );
    }
    this.currentPageNotifications$.next(currentPageNotifications);
  }

  private transformFirstUrlPathElement(firstUrlPathElement: string | undefined): MainPage | undefined {
    return firstUrlPathElement !== undefined && Object.values<string>(MainPage).includes(firstUrlPathElement)
      ? (firstUrlPathElement as MainPage)
      : undefined;
  }

  private createPageNotificationPolling(pollingTimeInMs: number): Observable<number> {
    return timer(1, pollingTimeInMs).pipe(
      tap(() => this.store.dispatch(PageNotificationActions.loadPageNotifications())),
      share()
    );
  }

  private getCurrentFirstUrlPathElement(): string | undefined {
    return this.extractUrlPathElement(location.pathname, 1);
  }

  private extractUrlPathElement(url: string, partNumber: number): string | undefined {
    const urlPathParts = url.split('/');
    if (urlPathParts.length < partNumber + 1) {
      return undefined;
    }
    return urlPathParts[partNumber];
  }
}
