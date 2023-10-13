import {BreakpointObserver} from '@angular/cdk/layout';
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {NavigationEnd, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription, filter, take, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from 'src/environments/environment';
import {PageNotificationComponent} from './shared/components/page-notification/page-notification.component';
import {Breakpoints} from './shared/enums/breakpoints.enum';
import {MainPage} from './shared/enums/main-page.enum';
import {PanelClass} from './shared/enums/panel-class.enum';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {DocumentService} from './shared/services/document.service';
import {IconsService} from './shared/services/icons.service';
import {PageNotificationService} from './shared/services/page-notification.service';
import {ScreenMode} from './shared/types/screen-size.type';
import {UrlUtils} from './shared/utils/url.utils';
import {AppLayoutActions} from './state/app/actions/app-layout.actions';
import {selectScreenMode, selectScrollbarWidth} from './state/app/reducers/app-layout.reducer';
import {selectMapUiState} from './state/map/reducers/map-ui.reducer';
import {MapUiState} from './state/map/states/map-ui.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public showWarning: boolean = false;
  public screenMode: ScreenMode = 'regular';
  public mapUiState?: MapUiState;

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
  private readonly useHeadlessPageOn: MainPage[] = [MainPage.Embedded];
  private readonly subscriptions: Subscription = new Subscription();
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly scrollbarWidth$ = this.store.select(selectScrollbarWidth);
  private readonly mapUiState$ = this.store.select(selectMapUiState);

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
        .observe([Breakpoints.mobile, Breakpoints.smallTablet, Breakpoints.regular])
        .pipe(
          tap(() => {
            let screenMode: ScreenMode;
            if (this.breakpointObserver.isMatched(Breakpoints.mobile)) {
              screenMode = 'mobile';
              this.showWarning = environment.production;
            } else if (this.breakpointObserver.isMatched(Breakpoints.smallTablet)) {
              screenMode = 'smallTablet';
            } else {
              screenMode = 'regular';
            }
            this.store.dispatch(AppLayoutActions.setScreenMode({screenMode: screenMode}));
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.mapUiState$
        .pipe(
          tap((mapUiState) => {
            this.mapUiState = mapUiState;
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
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
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
    this.isHeadlessPage = this.useHeadlessPageOn.some((headlessPagePaths) =>
      UrlUtils.containsSegmentPaths([headlessPagePaths], segmentPaths),
    );
  }
}
