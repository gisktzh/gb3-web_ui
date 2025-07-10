import {BreakpointObserver} from '@angular/cdk/layout';
import {Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren, inject} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
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
import {SkipLink} from './shared/types/skip-link.type';
import {SkipLinkConstants} from './shared/constants/skip-link.constants';
import {SkipLinkTemplateVariable} from './shared/enums/skip-link-template-variable.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly documentService = inject(DocumentService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly snackBar = inject(MatSnackBar);
  private readonly pageNotificationService = inject(PageNotificationService);
  private readonly store = inject(Store);
  private readonly iconsService = inject(IconsService);
  private readonly renderer = inject(Renderer2);

  @ViewChildren(Object.values(SkipLinkTemplateVariable).join(', '), {read: ElementRef}) private readonly elements!: QueryList<ElementRef>;

  protected screenMode: ScreenMode = 'regular';
  protected mapUiState?: MapUiState;
  protected isHeadlessPage: boolean = false;
  protected isSimplifiedPage: boolean = false;
  protected scrollbarWidth?: number;
  protected isDevModeActive: boolean = false;
  protected readonly skipLinks: SkipLink[] = SkipLinkConstants.skipLinks;
  protected readonly templateVariable = SkipLinkTemplateVariable;

  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;
  private readonly urlState$ = this.store.select(selectUrlState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly scrollbarWidth$ = this.store.select(selectScrollbarWidth);
  private readonly mapUiState$ = this.store.select(selectMapUiState);
  private readonly devMode$ = this.store.select(selectDevMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor() {
    this.iconsService.initIcons();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public skipToDomElement(elementId: string): void {
    const element = this.elements.find((el) => el.nativeElement.id === elementId);
    if (element) {
      this.renderer.setAttribute(element.nativeElement, 'tabindex', '-1');
      element.nativeElement.focus();
    }
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
          BreakpointsWidth.Mobile,
          BreakpointsWidth.SmallTablet,
          BreakpointsWidth.Regular,
          BreakpointsHeight.Regular,
          BreakpointsHeight.Small,
        ])
        .pipe(
          tap(() => {
            let screenMode: ScreenMode = 'regular';
            let screenHeight: ScreenHeight = 'regular';
            if (this.breakpointObserver.isMatched(BreakpointsWidth.Mobile)) {
              screenMode = 'mobile';
            } else if (this.breakpointObserver.isMatched(BreakpointsWidth.SmallTablet)) {
              screenMode = 'smallTablet';
            }
            if (this.breakpointObserver.isMatched(BreakpointsHeight.Small)) {
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
