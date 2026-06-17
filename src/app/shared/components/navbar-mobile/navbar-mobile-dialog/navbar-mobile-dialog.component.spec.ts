import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectIsAuthenticated} from 'src/app/state/auth/reducers/auth-status.reducer';
import {selectUserName} from 'src/app/state/auth/reducers/auth-status.reducer';
import {MatDialogRef} from '@angular/material/dialog';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog.component';
import {AuthStatusActions} from 'src/app/state/auth/actions/auth-status.actions';

describe('NavbarMobileDialogComponent', () => {
  let component: NavbarMobileDialogComponent;
  let fixture: ComponentFixture<NavbarMobileDialogComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const dialogRefMock: Partial<MatDialogRef<NavbarMobileDialogComponent>> = {
    close: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMobileDialogComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRefMock}, provideMockStore(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsAuthenticated, false);
    store.overrideSelector(selectUserName, undefined);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(NavbarMobileDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('authentication state', () => {
    it('should display login button when user is not authenticated', () => {
      const loginButton = compiled.querySelector<HTMLButtonElement>('.navbar__user');

      expect(loginButton).toBeTruthy();
      expect(loginButton?.textContent).toContain('Login');

      expect(compiled.querySelector('mat-menu')).toBeFalsy();
    });

    it('should display user menu trigger when authenticated', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectUserName, 'Test User');
      store.refreshState();

      fixture.detectChanges();

      const userButton = compiled.querySelector<HTMLButtonElement>('.navbar__user');

      expect(userButton).toBeTruthy();
      expect(userButton?.textContent).toContain('Test User');
    });
  });

  describe('actions', () => {
    it('should dispatch login action when login button is clicked', () => {
      const loginButton = compiled.querySelector<HTMLButtonElement>('.navbar__user');

      loginButton?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(AuthStatusActions.performLogin());
    });

    it('should dispatch logout action when logout button is clicked', async () => {
      vi.useFakeTimers();
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectUserName, 'Test User');
      store.refreshState();

      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(component.isAuthenticated()).toBe(true);

      compiled.querySelector<HTMLButtonElement>('.navbar__item.navbar__user')?.click();

      await vi.runAllTimersAsync();

      const logoutButton = document.querySelector<HTMLButtonElement>('button.navbar__user__logout');
      expect(logoutButton).toBeTruthy();

      logoutButton?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        AuthStatusActions.performLogout({
          isForced: false,
        }),
      );
    });
  });

  describe('close', () => {
    it('should close dialog with aborted false by default', () => {
      component.close();

      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should close dialog with provided abort value', () => {
      component.close(true);

      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog when close icon button is clicked', () => {
      const closeButton = compiled.querySelector<HTMLButtonElement>('button[mat-icon-button]');

      closeButton?.click();

      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });
  });

  describe('navigation links', () => {
    it('should render all navigation items', () => {
      const links = compiled.querySelectorAll<HTMLAnchorElement>('.navbar-mobile__dialog__content__container a');

      expect(links.length).toBeGreaterThan(0);
      expect(links[0]?.textContent).toContain('Geoportal');
      expect(links[1]?.textContent).toContain('GIS-Browser');
      expect(links[2]?.textContent).toContain('Geodatenkatalog');
      expect(links[3]?.textContent).toContain('Apps');
      expect(links[4]?.textContent).toContain('Hilfe & Support');
    });

    it('should close dialog when navigation link is clicked', () => {
      const geoportalLink = compiled.querySelector<HTMLAnchorElement>('.navbar-mobile__dialog__content__container a');

      geoportalLink?.click();

      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });
  });

  describe('user links', () => {
    it('should render profile and logout options when authenticated', async () => {
      vi.useFakeTimers();
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectUserName, 'Test User');
      store.refreshState();

      fixture.detectChanges();

      await vi.runAllTimersAsync();

      expect(component.isAuthenticated()).toBe(true);
      compiled.querySelector<HTMLButtonElement>('.navbar__item.navbar__user')?.click();

      await vi.runAllTimersAsync();

      const profileLink = document.querySelector<HTMLAnchorElement>('a[href="https://maps.zh.ch/groups_users"]');

      expect(profileLink).toBeTruthy();
      expect(profileLink?.textContent).toContain('Profil');

      const logoutButton = document.querySelector<HTMLButtonElement>('button.navbar__user__logout');

      expect(logoutButton).toBeTruthy();
      expect(logoutButton?.textContent).toContain('Logout');
    });
  });
});
