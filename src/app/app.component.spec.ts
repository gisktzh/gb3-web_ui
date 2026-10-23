import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {NO_ERRORS_SCHEMA, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {BehaviorSubject} from 'rxjs';
import {AppComponent} from './app.component';
import {BreakpointsHeight, BreakpointsWidth} from './shared/enums/breakpoints.enum';
import {MainPage} from './shared/enums/main-page.enum';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {IconsService} from './shared/services/icons.service';
import {PageNotificationService} from './shared/services/page-notification.service';
import {AppLayoutActions} from './state/app/actions/app-layout.actions';
import {selectScreenMode, selectScrollbarWidth} from './state/app/reducers/app-layout.reducer';
import {selectAccessMode} from './state/app/reducers/app.reducer';
import {selectUrlState} from './state/app/reducers/url.reducer';
import {selectMapUiState} from './state/map/reducers/map-ui.reducer';

describe('AppComponent', () => {
  it('initializes global services and translates responsive breakpoints into layout state', async () => {
    const breakpoints = new BehaviorSubject<BreakpointState>({matches: false, breakpoints: {}});
    const icons = {initIcons: vi.fn()};
    const snackBar = {openFromComponent: vi.fn(), dismiss: vi.fn()};
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMockStore(),
        {provide: BreakpointObserver, useValue: {observe: () => breakpoints}},
        {provide: IconsService, useValue: icons},
        {provide: PageNotificationService, useValue: {currentPageNotifications: signal([])}},
        {provide: MatSnackBar, useValue: snackBar},
      ],
    })
      .overrideComponent(AppComponent, {set: {imports: [], schemas: [NO_ERRORS_SCHEMA]}})
      .compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectScrollbarWidth, 0);
    store.overrideSelector(selectAccessMode, 'internet');
    store.overrideSelector(selectUrlState, {
      mainPage: MainPage.Start,
      previousPage: undefined,
      isHeadlessPage: false,
      isSimplifiedPage: false,
      keepTemporaryUrlParams: false,
    });
    store.overrideSelector(selectMapUiState, {hideUiElements: false} as never);
    store.refreshState();
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(icons.initIcons).toHaveBeenCalledOnce();

    breakpoints.next({
      matches: true,
      breakpoints: {[BreakpointsWidth.Mobile]: true, [BreakpointsWidth.SmallTablet]: false, [BreakpointsHeight.Small]: true},
    });
    fixture.detectChanges();
    expect(dispatch).toHaveBeenCalledWith(AppLayoutActions.setScreenMode({screenMode: 'mobile', screenHeight: 'small'}));
  });

  it('opens the first page notification and marks intranet mode on the document body', async () => {
    const currentPageNotifications = signal<PageNotification[]>([]);
    const dismiss = vi.fn();
    const snackBar = {openFromComponent: vi.fn(() => ({dismiss}))};
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideMockStore(),
        {provide: BreakpointObserver, useValue: {observe: () => new BehaviorSubject<BreakpointState>({matches: false, breakpoints: {}})}},
        {provide: IconsService, useValue: {initIcons: vi.fn()}},
        {provide: PageNotificationService, useValue: {currentPageNotifications}},
        {provide: MatSnackBar, useValue: snackBar},
      ],
    })
      .overrideComponent(AppComponent, {set: {imports: [], schemas: [NO_ERRORS_SCHEMA]}})
      .compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectScrollbarWidth, 0);
    store.overrideSelector(selectAccessMode, 'intranet');
    store.overrideSelector(selectUrlState, {
      mainPage: MainPage.Start,
      previousPage: undefined,
      isHeadlessPage: false,
      isSimplifiedPage: false,
      keepTemporaryUrlParams: false,
    });
    store.overrideSelector(selectMapUiState, {hideUiElements: false} as never);
    store.refreshState();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(document.body.classList).toContain('body--is-intranet');

    const notification: PageNotification = {
      id: 'notice',
      title: 'Maintenance',
      description: 'Brief outage',
      pages: [MainPage.Start],
      fromDate: new Date('2026-01-01'),
      toDate: new Date('2026-01-02'),
      severity: 'info',
      isMarkedAsRead: false,
    };
    currentPageNotifications.set([notification]);
    fixture.detectChanges();
    expect(snackBar.openFromComponent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({data: notification}));
    currentPageNotifications.set([]);
    fixture.detectChanges();
    expect(dismiss).toHaveBeenCalledOnce();
    fixture.destroy();
    document.body.classList.remove('body--is-intranet');
  });
});
