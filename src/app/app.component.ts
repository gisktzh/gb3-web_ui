import {BreakpointObserver} from '@angular/cdk/layout';
import {Component, ElementRef, computed, effect, inject, viewChildren} from '@angular/core';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {Store} from '@ngrx/store';
import {PageNotificationComponent} from './shared/components/page-notification/page-notification.component';
import {BreakpointsHeight, BreakpointsWidth} from './shared/enums/breakpoints.enum';
import {PanelClass} from './shared/enums/panel-class.enum';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {IconsService} from './shared/services/icons.service';
import {PageNotificationService} from './shared/services/page-notification.service';
import {ScreenHeight} from './shared/types/screen-height-type';
import {ScreenMode} from './shared/types/screen-size.type';
import {AppLayoutActions} from './state/app/actions/app-layout.actions';
import {selectScreenMode, selectScrollbarWidth} from './state/app/reducers/app-layout.reducer';
import {selectUrlState} from './state/app/reducers/url.reducer';
import {selectMapUiState} from './state/map/reducers/map-ui.reducer';
import {SkipLink} from './shared/types/skip-link.type';
import {SkipLinkConstants} from './shared/constants/skip-link.constants';
import {SkipLinkTemplateVariable} from './shared/enums/skip-link-template-variable.enum';
import {SkipLinkComponent} from './shared/components/skip-link/skip-link.component';
import {NavbarMobileComponent} from './shared/components/navbar-mobile/navbar-mobile.component';
import {NavbarComponent} from './shared/components/navbar/navbar.component';
import {RouterOutlet} from '@angular/router';
import {MainFooterComponent} from './shared/components/footer/main-footer.component';
import {ScrollbarWidthCalculationComponent} from './shared/components/scrollbar-width-calculation/scrollbar-width-calculation.component';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    SkipLinkComponent,
    NavbarMobileComponent,
    NavbarComponent,
    RouterOutlet,
    MainFooterComponent,
    ScrollbarWidthCalculationComponent,
  ],
})
export class AppComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly snackBar = inject(MatSnackBar);
  private readonly pageNotificationService = inject(PageNotificationService);
  private readonly store = inject(Store);
  private readonly iconsService = inject(IconsService);
  private readonly elements = viewChildren<HTMLElement, ElementRef<HTMLElement>>(Object.values(SkipLinkTemplateVariable).join(', '), {
    read: ElementRef<HTMLElement>,
  });
  protected readonly screenMode = this.store.selectSignal(selectScreenMode);
  protected readonly mapUiState = this.store.selectSignal(selectMapUiState);
  protected readonly urlState = this.store.selectSignal(selectUrlState);
  protected readonly isHeadlessPage = computed(() => {
    const urlState = this.urlState();
    if (!urlState) {
      return false;
    }

    return urlState.isHeadlessPage;
  });
  protected readonly isSimplifiedPage = computed(() => {
    const urlState = this.urlState();
    if (!urlState) {
      return false;
    }

    return urlState.isSimplifiedPage;
  });
  protected readonly scrollbarWidth = this.store.selectSignal(selectScrollbarWidth);
  protected readonly breakpointState = toSignal(
    this.breakpointObserver.observe([
      BreakpointsWidth.Mobile,
      BreakpointsWidth.SmallTablet,
      BreakpointsWidth.Regular,
      BreakpointsHeight.Regular,
      BreakpointsHeight.Small,
    ]),
  );
  protected readonly skipLinks: SkipLink[] = SkipLinkConstants.skipLinks;
  protected readonly templateVariable = SkipLinkTemplateVariable;
  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;

  constructor() {
    this.iconsService.initIcons();
    effect(() => {
      const breakpointState = this.breakpointState();
      if (!breakpointState) {
        return;
      }

      let screenMode: ScreenMode = 'regular';
      let screenHeight: ScreenHeight = 'regular';

      if (breakpointState.breakpoints[BreakpointsWidth.Mobile]) {
        screenMode = 'mobile';
      } else if (breakpointState.breakpoints[BreakpointsWidth.SmallTablet]) {
        screenMode = 'smallTablet';
      }

      if (breakpointState.breakpoints[BreakpointsHeight.Small]) {
        screenHeight = 'small';
      }

      this.store.dispatch(AppLayoutActions.setScreenMode({screenMode, screenHeight}));
    });

    effect(() => {
      const pageNotifications = this.pageNotificationService.currentPageNotifications();

      if (pageNotifications.length > 0) {
        this.openPageNotificationSnackBar(pageNotifications[0]);
      } else {
        this.closePageNotificationSnackBar();
      }
    });
  }

  public skipToDomElement(elementId: string): void {
    const element = this.elements().find((el) => el.nativeElement.id === elementId);
    if (element?.nativeElement) {
      element.nativeElement.setAttribute('tabindex', '-1');
      element.nativeElement.focus();
    }
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
