import {BreakpointObserver} from '@angular/cdk/layout';
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {filter, Subscription, take, tap} from 'rxjs';
import {PageNotificationComponent} from './shared/components/page-notification/page-notification.component';
import {BreakpointsHeight, BreakpointsWidth} from './shared/enums/breakpoints.enum';
import {PanelClass} from './shared/enums/panel-class.enum';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {DocumentService} from './shared/services/document.service';
import {IconsService} from './shared/services/icons.service';
import {PageNotificationService} from './shared/services/page-notification.service';
import {ScreenHeight} from './shared/types/screen-height-type';
import {ScreenMode} from './shared/types/screen-size.type';
import {AppLayoutActions} from './state/app/actions/app-layout.actions';
import {selectScreenMode, selectScrollbarWidth} from './state/app/reducers/app-layout.reducer';
import {selectUrlState} from './state/app/reducers/url.reducer';
import {selectMapUiState} from './state/map/reducers/map-ui.reducer';
import {MapUiState} from './state/map/states/map-ui.state';
import {selectDevMode} from './state/app/reducers/app.reducer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  public screenMode: ScreenMode = 'regular';
  public mapUiState?: MapUiState;
  public isHeadlessPage: boolean = false;
  public isSimplifiedPage: boolean = false;
  public scrollbarWidth?: number;
  public isDevModeActive: boolean = false;

  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;
  private readonly urlState$ = this.store.select(selectUrlState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly scrollbarWidth$ = this.store.select(selectScrollbarWidth);
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly devMode$ = this.store.select(selectDevMode);
  private readonly subscriptions: Subscription = new Subscription();

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
      this.urlState$
        .pipe(
          tap(({isSimplifiedPage, isHeadlessPage}) => {
            this.isSimplifiedPage = isSimplifiedPage;
            this.isHeadlessPage = isHeadlessPage;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.breakpointObserver
        .observe([
          BreakpointsWidth.mobile,
          BreakpointsWidth.smallTablet,
          BreakpointsWidth.regular,
          BreakpointsHeight.regular,
          BreakpointsHeight.small,
        ])
        .pipe(
          tap(() => {
            let screenMode: ScreenMode = 'regular';
            let screenHeight: ScreenHeight = 'regular';
            if (this.breakpointObserver.isMatched(BreakpointsWidth.mobile)) {
              screenMode = 'mobile';
            } else if (this.breakpointObserver.isMatched(BreakpointsWidth.smallTablet)) {
              screenMode = 'smallTablet';
            }
            if (this.breakpointObserver.isMatched(BreakpointsHeight.small)) {
              screenHeight = 'small';
            }
            this.store.dispatch(AppLayoutActions.setScreenMode({screenMode, screenHeight}));
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.mapUiState$.pipe(tap((mapUiState) => (this.mapUiState = mapUiState))).subscribe());
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
    this.subscriptions.add(this.devMode$.pipe(tap((devMode) => (this.isDevModeActive = devMode))).subscribe());
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
}
