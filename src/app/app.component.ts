import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DocumentService} from './shared/services/document.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {filter, Subscription, take, tap} from 'rxjs';
import {PageNotificationService} from './shared/services/page-notification.service';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {PageNotificationComponent} from './shared/components/page-notification/page-notification.component';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {PanelClass} from './shared/enums/panel-class.enum';
import {NavigationEnd, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {MainPage} from './shared/enums/main-page.enum';
import {UrlUtils} from './shared/utils/url.utils';
import {Store} from '@ngrx/store';
import {selectScrollbarWidth} from './state/app/reducers/app-layout.reducer';
import {IconsService} from './shared/services/icons.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('content') private readonly contentContainer?: ElementRef;

  public showWarning: boolean = false;
  /**
   * Flag which can be used to completely hide header and footer, e.g. on an iframe page
   */
  public isHeadlessPage: boolean = false;
  /**
   * Flag which can be used to toggle simplified layouts, e.g. no ZH Lion in the header.
   */
  public isSimplifiedPage: boolean = false;
  public scrollbarWidth?: number;
  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;
  private readonly useSimplifiedPageOn: MainPage[] = [MainPage.Maps];
  private readonly useHeadlessPageOn: string[][] = [[MainPage.Embedded]];
  private readonly subscriptions: Subscription = new Subscription();
  private readonly scrollbarWidth$ = this.store.select(selectScrollbarWidth);

  constructor(
    private readonly documentService: DocumentService,
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly snackBar: MatSnackBar,
    private readonly pageNotificationService: PageNotificationService,
    private readonly store: Store,
    private readonly iconsService: IconsService,
  ) {
    this.iconsService.initIcons();
  }

  public ngOnInit() {
    // initialize some values based on the current URL before the first routing happens
    this.handleNavigationChanges(window.location.pathname);
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  private onDocumentClick(event: PointerEvent) {
    this.documentService.documentClicked$.next(event);
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.breakpointObserver
        .observe([Breakpoints.Small, Breakpoints.XSmall])
        .pipe(
          tap((result) => {
            this.showWarning = result.matches;
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((evt) => evt instanceof NavigationEnd),
          map((evt) => evt as NavigationEnd),
          tap((evt) => {
            this.handleNavigationChanges(evt.url);
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.pageNotificationService.currentPageNotifications$
        .pipe(
          tap((pageNotifications) => {
            if (pageNotifications.length > 0) {
              // there should be only one page notification active at the same time by definition
              // if there are more than one (as that's technically possible) we only the first one and ignore the rest for now
              this.openPageNotificationSnackBar(pageNotifications[0]);
            } else {
              this.closePageNotificationSnackBar();
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.scrollbarWidth$
        .pipe(
          filter((scrollbarWidth) => scrollbarWidth !== undefined),
          tap((scrollbarWidth) => {
            // this is necessary to prevent an error (NG0100: ExpressionChangedAfterItHasBeenCheckedError) as the value usually gets updated so fast
            // that the UI update cycle was not yet fully completed.
            setTimeout(() => (this.scrollbarWidth = scrollbarWidth));
          }),
          take(1),
        )
        .subscribe(),
    );
  }

  private closePageNotificationSnackBar() {
    this.snackBarRef?.dismiss();
    this.snackBarRef = undefined;
  }

  private openPageNotificationSnackBar(pageNotification: PageNotification) {
    this.snackBarRef = this.snackBar.openFromComponent(PageNotificationComponent, {
      data: pageNotification,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: PanelClass.PageNotificationSnackbar,
    });
  }

  private handleNavigationChanges(url: string) {
    const urlTree = this.router.parseUrl(url);
    const urlSegments = UrlUtils.extractUrlSegments(urlTree);
    const firstUrlSegmentPath = UrlUtils.extractFirstUrlSegmentPath(urlSegments);
    const mainPage = UrlUtils.transformStringToMainPage(firstUrlSegmentPath);
    this.isSimplifiedPage = mainPage !== undefined && this.useSimplifiedPageOn.includes(mainPage);
    const segmentPaths: string[] = urlSegments.map((segment) => segment.path);
    this.isHeadlessPage =
      segmentPaths.length > 0 &&
      this.useHeadlessPageOn.some((headlessPagePaths) => UrlUtils.containsSegmentPaths(headlessPagePaths, segmentPaths));
  }
}
