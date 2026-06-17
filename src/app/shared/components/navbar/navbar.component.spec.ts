import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {selectUserName} from '../../../state/auth/reducers/auth-status.reducer';
import {selectScrollbarWidth} from '../../../state/app/reducers/app-layout.reducer';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {MatDialog} from '@angular/material/dialog';
import {NavbarComponent} from './navbar.component';
import {inputBinding, signal} from '@angular/core';
import {AuthStatusActions} from 'src/app/state/auth/actions/auth-status.actions';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from '../navbar-mobile/navbar-mobile-dialog/navbar-mobile-dialog.component';
import {provideRouter} from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const dialogMock: Partial<MatDialog> = {
    open: vi.fn(),
  };
  const isSimplifiedPage = signal<boolean | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [{provide: MatDialog, useValue: dialogMock}, provideMockStore(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsAuthenticated, false);
    store.overrideSelector(selectUserName, undefined);
    store.overrideSelector(selectScrollbarWidth, undefined);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(NavbarComponent, {
      bindings: [inputBinding('isSimplifiedPage', isSimplifiedPage)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('navbar mode', () => {
    it('should render full navigation when screen mode is regular', () => {
      store.overrideSelector(selectScreenMode, 'regular');
      store.refreshState();

      fixture.detectChanges();

      expect(compiled.querySelector('.navbar')).toBeTruthy();

      expect(compiled.querySelector<HTMLAnchorElement>('.navbar__item')).toBeTruthy();
    });

    it('should render mobile menu button when screen mode is not regular', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();

      fixture.detectChanges();

      const menuButton = compiled.querySelector<HTMLButtonElement>('.navbar__menu-text');

      expect(menuButton).toBeTruthy();
      expect(menuButton?.textContent).toContain('Menu');
    });

    it('should call showMenu when mobile menu button is clicked', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();

      fixture.detectChanges();

      vi.spyOn(component, 'showMenu');

      const menuButton = compiled.querySelector<HTMLButtonElement>('.navbar__menu-text');

      menuButton?.click();

      expect(component.showMenu).toHaveBeenCalled();
    });
  });

  describe('simplified page', () => {
    it('should show logo when simplified page is true', () => {
      isSimplifiedPage.set(true);

      fixture.detectChanges();

      const logo = compiled.querySelector<HTMLImageElement>('.navbar__logo');

      expect(logo?.style.display).toBe('inline');
    });

    it('should hide logo when simplified page is false', () => {
      isSimplifiedPage.set(false);

      fixture.detectChanges();

      const logo = compiled.querySelector<HTMLImageElement>('.navbar__logo');

      expect(logo?.style.display).toBe('none');
    });

    it('should hide underline when simplified page is true', () => {
      isSimplifiedPage.set(true);

      fixture.detectChanges();

      expect(compiled.querySelector('.navbar__underline-container')).toBeFalsy();
    });

    it('should show underline when simplified page is false', () => {
      isSimplifiedPage.set(false);

      fixture.detectChanges();

      expect(compiled.querySelector('.navbar__underline-container')).toBeTruthy();
    });
  });

  describe('scrollbar width', () => {
    it('should apply scrollbar width style', () => {
      store.overrideSelector(selectScrollbarWidth, 42);
      store.refreshState();

      fixture.detectChanges();

      const underline = compiled.querySelector<HTMLElement>('.navbar__underline-container > .navbar__underline');

      expect(underline?.style.width).toBe('42px');
    });
  });

  describe('authentication actions', () => {
    it('should show login button when unauthenticated', () => {
      store.overrideSelector(selectIsAuthenticated, false);
      store.refreshState();

      fixture.detectChanges();

      const loginButton = compiled.querySelector<HTMLButtonElement>('.navbar__item--button');

      expect(loginButton).toBeTruthy();
      expect(loginButton?.textContent).toContain('Login');
    });

    it('should dispatch login action when login button is clicked', () => {
      const loginButton = compiled.querySelector<HTMLButtonElement>('.navbar__item--button');

      loginButton?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.performLogin());
    });

    it('should show username when authenticated', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectUserName, 'Test User');
      store.refreshState();

      fixture.detectChanges();

      const userButton = compiled.querySelector<HTMLButtonElement>('.navbar__item--button');

      expect(userButton).toBeTruthy();
      expect(userButton?.textContent).toContain('Test User');
    });

    it('should dispatch logout action when logout is clicked', async () => {
      vi.useFakeTimers();

      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectUserName, 'Test User');
      store.refreshState();

      fixture.detectChanges();

      await vi.runAllTimersAsync();

      compiled.querySelector<HTMLButtonElement>('.navbar__item__user-trigger')?.click();

      await vi.runAllTimersAsync();

      const logoutButton = document.querySelector<HTMLButtonElement>('button.navbar__item__logout-button');
      expect(logoutButton).toBeTruthy();

      logoutButton?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        AuthStatusActions.performLogout({
          isForced: false,
        }),
      );
    });
  });

  describe('showMenu', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should open mobile dialog with correct configuration', () => {
      component.showMenu();

      expect(dialogMock.open).toHaveBeenCalledWith(NavbarMobileDialogComponent, {
        position: {
          top: '0',
          right: '0',
        },
        maxWidth: '433px',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        panelClass: PanelClass.ApiWrapperDialog,
        autoFocus: false,
        hasBackdrop: false,
      });
    });
  });
});
