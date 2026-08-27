import {Component, input, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {selectScreenMode, selectScrollbarWidth} from './state/app/reducers/app-layout.reducer';
import {selectMapUiState} from './state/map/reducers/map-ui.reducer';
import {selectUrlState} from './state/app/reducers/url.reducer';
import {PageNotificationService} from './shared/services/page-notification.service';
import {IconsService} from './shared/services/icons.service';
import {AppComponent} from './app.component';
import {AppLayoutActions} from './state/app/actions/app-layout.actions';
import {BreakpointsHeight, BreakpointsWidth} from './shared/enums/breakpoints.enum';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {PanelClass} from './shared/enums/panel-class.enum';
import {SkipLinkComponent} from './shared/components/skip-link/skip-link.component';
import {NavbarMobileComponent} from './shared/components/navbar-mobile/navbar-mobile.component';
import {NavbarComponent} from './shared/components/navbar/navbar.component';
import {MainFooterComponent} from './shared/components/footer/main-footer.component';
import {ScrollbarWidthCalculationComponent} from './shared/components/scrollbar-width-calculation/scrollbar-width-calculation.component';
import {BehaviorSubject} from 'rxjs';
import {By} from '@angular/platform-browser';

@Component({
  selector: 'skip-link',
  standalone: true,
  template: '',
})
class MockSkipLinkComponent {
  public readonly skipLinks = input([]);
}

@Component({
  selector: 'navbar-mobile',
  standalone: true,
  template: '',
})
class MockNavbarMobileComponent {}

@Component({
  selector: 'navbar',
  standalone: true,
  template: '',
})
class MockNavbarComponent {
  public readonly isSimplifiedPage = input(false);
}

@Component({
  selector: 'main-footer',
  standalone: true,
  template: '',
})
class MockMainFooterComponent {}

@Component({
  selector: 'scrollbar-width-calculation',
  standalone: true,
  template: '',
})
class MockScrollbarWidthCalculationComponent {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const breakpointBehaviourSubject = new BehaviorSubject<BreakpointState>({
    matches: false,
    breakpoints: {
      [BreakpointsWidth.Mobile]: false,
      [BreakpointsWidth.SmallTablet]: false,
      [BreakpointsHeight.Small]: false,
    },
  });

  const breakpointObserverMock: Partial<BreakpointObserver> = {
    observe: vi.fn(() => breakpointBehaviourSubject.asObservable()),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We want `any` here to have a valid mock.
  const snackBarRefMock: MatSnackBarRef<any> = {
    dismiss: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- We want `any` here to have a valid mock.
  } as unknown as MatSnackBarRef<any>;

  const snackBarMock: Partial<MatSnackBar> = {
    openFromComponent: vi.fn(() => snackBarRefMock),
  };

  const pageNotifications = signal<PageNotification[]>([]);

  const pageNotificationServiceMock: Partial<PageNotificationService> = {
    currentPageNotifications: pageNotifications,
  };

  const iconsServiceMock: Partial<IconsService> = {
    initIcons: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {provide: BreakpointObserver, useValue: breakpointObserverMock},
        {provide: MatSnackBar, useValue: snackBarMock},
        {provide: PageNotificationService, useValue: pageNotificationServiceMock},
        {provide: IconsService, useValue: iconsServiceMock},
        provideMockStore(),
        provideRouter([]),
      ],
    })
      .overrideComponent(AppComponent, {
        remove: {
          imports: [SkipLinkComponent, NavbarMobileComponent, NavbarComponent, MainFooterComponent, ScrollbarWidthCalculationComponent],
        },
        add: {
          imports: [
            MockSkipLinkComponent,
            MockNavbarMobileComponent,
            MockNavbarComponent,
            MockMainFooterComponent,
            MockScrollbarWidthCalculationComponent,
          ],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: false,
      isSimplifiedPage: false,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.overrideSelector(selectScrollbarWidth, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(AppComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;

    fixture.detectChanges();
  });

  afterEach(() => {
    pageNotifications.set([]);
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize icons', () => {
    expect(iconsServiceMock.initIcons).toHaveBeenCalled();
  });

  it('should render the skip link on a normal page', () => {
    expect(compiled.querySelector('skip-link')).toBeTruthy();
  });

  it('should hide the skip link on a headless page', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: true,
      isSimplifiedPage: false,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('skip-link')).toBeNull();
  });

  it('should hide the skip link on a simplified page', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: false,
      isSimplifiedPage: true,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('skip-link')).toBeNull();
  });

  it('should render the mobile navbar on mobile screens', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('navbar-mobile')).toBeTruthy();
    expect(compiled.querySelector('navbar')).toBeNull();
  });

  it('should hide the mobile navbar when map UI elements are hidden', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.overrideSelector(selectMapUiState, {
      hideUiElements: true,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('navbar-mobile')).toBeNull();
    expect(compiled.querySelector('navbar')).toBeNull();
  });

  it('should render the regular navbar on non-mobile screens', () => {
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectMapUiState, {
      hideUiElements: false,
      mapSideDrawerContent: 'none',
      isLegendOverlayVisible: false,
      isFeatureInfoOverlayVisible: false,
      isElevationProfileOverlayVisible: false,
      isAttributeFilterOverlayVisible: false,
      isDrawingEditOverlayVisible: false,
      isMapSideDrawerOpen: false,
      hideToggleUiElementsButton: false,
      hideZoomButtons: false,
      toolMenuVisibility: undefined,
      bottomSheetContent: 'search',
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('navbar')).toBeTruthy();
    expect(compiled.querySelector('navbar-mobile')).toBeNull();
  });

  it('should not render the regular navbar on a headless page', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: true,
      isSimplifiedPage: false,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('navbar')).toBeNull();
    expect(compiled.querySelector('navbar-mobile')).toBeNull();
  });

  it('should not render the regular navbar on a mobile screen', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('navbar')).toBeNull();
  });

  it('should pass the simplified-page state to the navbar', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: false,
      isSimplifiedPage: true,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockNavbarComponent)).componentInstance.isSimplifiedPage()).toBeTruthy();
  });

  it('should add the headless-page class to the article on a headless page', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: true,
      isSimplifiedPage: false,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('article')?.classList.contains('app__headless-page')).toBe(true);
  });

  it('should not add the headless-page class to the article on a regular page', () => {
    expect(compiled.querySelector('article')?.classList.contains('app__headless-page')).toBe(false);
  });

  it('should render the footer on a normal page', () => {
    expect(compiled.querySelector('main-footer')).toBeTruthy();
  });

  it('should hide the footer on a headless page', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: true,
      isSimplifiedPage: false,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('main-footer')).toBeNull();
  });

  it('should hide the footer on a simplified page', () => {
    store.overrideSelector(selectUrlState, {
      isHeadlessPage: false,
      isSimplifiedPage: true,
      mainPage: undefined,
      previousPage: undefined,
      keepTemporaryUrlParams: false,
    });
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('main-footer')).toBeNull();
  });

  it('should render scrollbar width calculation when scrollbar width is undefined', () => {
    store.overrideSelector(selectScrollbarWidth, undefined);
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('scrollbar-width-calculation')).toBeTruthy();
  });

  it('should hide scrollbar width calculation when scrollbar width is known', () => {
    store.overrideSelector(selectScrollbarWidth, 15);
    store.refreshState();

    fixture.detectChanges();

    expect(compiled.querySelector('scrollbar-width-calculation')).toBeNull();
  });

  it('should dispatch regular screen mode when no mobile breakpoint is active', () => {
    breakpointBehaviourSubject.next({
      matches: false,
      breakpoints: {
        [BreakpointsWidth.Mobile]: false,
        [BreakpointsWidth.SmallTablet]: false,
        [BreakpointsHeight.Small]: false,
      },
    });

    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      AppLayoutActions.setScreenMode({
        screenMode: 'regular',
        screenHeight: 'regular',
      }),
    );
  });

  it('should dispatch mobile screen mode when the mobile breakpoint is active', () => {
    breakpointBehaviourSubject.next({
      matches: true,
      breakpoints: {
        [BreakpointsWidth.Mobile]: true,
        [BreakpointsWidth.SmallTablet]: false,
        [BreakpointsHeight.Small]: false,
      },
    });

    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      AppLayoutActions.setScreenMode({
        screenMode: 'mobile',
        screenHeight: 'regular',
      }),
    );
  });

  it('should dispatch small tablet screen mode when the small tablet breakpoint is active', () => {
    breakpointBehaviourSubject.next({
      matches: true,
      breakpoints: {
        [BreakpointsWidth.Mobile]: false,
        [BreakpointsWidth.SmallTablet]: true,
        [BreakpointsHeight.Small]: false,
      },
    });

    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      AppLayoutActions.setScreenMode({
        screenMode: 'smallTablet',
        screenHeight: 'regular',
      }),
    );
  });

  it('should dispatch small screen height when the small height breakpoint is active', () => {
    breakpointBehaviourSubject.next({
      matches: false,
      breakpoints: {
        [BreakpointsWidth.Mobile]: false,
        [BreakpointsWidth.SmallTablet]: false,
        [BreakpointsHeight.Small]: true,
      },
    });

    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      AppLayoutActions.setScreenMode({
        screenMode: 'regular',
        screenHeight: 'small',
      }),
    );
  });

  it('should skip to a matching DOM element', () => {
    const target = compiled.querySelector<HTMLElement>('#mainContent')!;
    const focusSpy = vi.spyOn(target, 'focus');

    component.skipToDomElement('mainContent');

    expect(focusSpy).toHaveBeenCalled();
    expect(target.getAttribute('tabindex')).toBe('-1');
  });

  it('should do nothing when the requested DOM element does not exist', () => {
    component.skipToDomElement('does-not-exist');

    expect(compiled.querySelector('[tabindex="-1"]')).toBeNull();
  });

  it('should open a snackbar when page notifications exist', () => {
    const notification: PageNotification = {
      id: '1',
      title: '1',
      description: '1',
      pages: [],
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    };

    pageNotifications.set([notification]);
    fixture.detectChanges();

    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(expect.anything(), {
      data: notification,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: PanelClass.PageNotificationSnackbar,
    });
  });

  it('should close the snackbar when there are no page notifications', async () => {
    vi.useFakeTimers();

    const notification: PageNotification = {
      id: '1',
      title: '1',
      description: '1',
      pages: [],
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    };

    pageNotifications.set([notification]);
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    pageNotifications.set([]);
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(snackBarRefMock.dismiss).toHaveBeenCalled();
  });

  it('should open a snackbar only for the first page notification', () => {
    const firstNotification: PageNotification = {
      id: '1',
      title: '1',
      description: '1',
      pages: [],
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    };
    const secondNotification: PageNotification = {
      id: '2',
      title: '2',
      description: '2',
      pages: [],
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    };

    pageNotifications.set([firstNotification, secondNotification]);
    fixture.detectChanges();

    expect(snackBarMock.openFromComponent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: firstNotification,
      }),
    );
  });

  it('should update the snackbar when notifications change', () => {
    const firstNotification: PageNotification = {
      id: '1',
      title: '1',
      description: '1',
      pages: [],
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    };
    const secondNotification: PageNotification = {
      id: '2',
      title: '2',
      description: '2',
      pages: [],
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    };

    pageNotifications.set([firstNotification]);
    fixture.detectChanges();

    pageNotifications.set([secondNotification]);
    fixture.detectChanges();

    expect(snackBarMock.openFromComponent).toHaveBeenCalledTimes(2);
    expect(snackBarMock.openFromComponent).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: secondNotification,
      }),
    );
  });
});
