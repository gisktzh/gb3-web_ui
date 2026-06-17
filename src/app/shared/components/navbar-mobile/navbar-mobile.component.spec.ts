import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectUrlState} from 'src/app/state/app/reducers/url.reducer';
import {MatDialog} from '@angular/material/dialog';
import {NavbarMobileComponent} from './navbar-mobile.component';
import {UrlState} from 'src/app/state/app/states/url.state';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog/navbar-mobile-dialog.component';

describe('NavbarMobileComponent', () => {
  let component: NavbarMobileComponent;
  let fixture: ComponentFixture<NavbarMobileComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const dialogMock: Partial<MatDialog> = {
    open: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMobileComponent],
      providers: [{provide: MatDialog, useValue: dialogMock}, provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectUrlState, {} as UrlState);
    store.refreshState();

    fixture = TestBed.createComponent(NavbarMobileComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isSimplifiedPage', () => {
    it('should return false when url state is undefined', () => {
      store.overrideSelector(selectUrlState, {} as UrlState);
      store.refreshState();

      fixture.detectChanges();

      expect(component.isSimplifiedPage()).toBe(false);
    });

    it('should return false when url state is not simplified', () => {
      store.overrideSelector(selectUrlState, {
        isSimplifiedPage: false,
      } as UrlState);
      store.refreshState();

      fixture.detectChanges();

      expect(component.isSimplifiedPage()).toBe(false);
    });

    it('should return true when url state is simplified', () => {
      store.overrideSelector(selectUrlState, {
        isSimplifiedPage: true,
      } as UrlState);
      store.refreshState();

      fixture.detectChanges();

      expect(component.isSimplifiedPage()).toBe(true);
    });
  });

  describe('template', () => {
    it('should render full navbar when page is not simplified', () => {
      store.overrideSelector(selectUrlState, {
        isSimplifiedPage: false,
      } as UrlState);
      store.refreshState();

      fixture.detectChanges();

      expect(compiled.querySelector('.navbar-mobile')).toBeTruthy();

      expect(compiled.querySelector('.navbar-mobile-simplified')).toBeFalsy();
    });

    it('should render simplified navbar when page is simplified', () => {
      store.overrideSelector(selectUrlState, {
        isSimplifiedPage: true,
      } as UrlState);
      store.refreshState();

      fixture.detectChanges();

      expect(compiled.querySelector('.navbar-mobile-simplified')).toBeTruthy();

      expect(compiled.querySelector('.navbar-mobile')).toBeFalsy();
    });
  });

  describe('showMenu', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should open dialog with correct configuration', () => {
      component.showMenu();

      expect(dialogMock.open).toHaveBeenCalledWith(NavbarMobileDialogComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        panelClass: PanelClass.ApiWrapperDialog,
        autoFocus: false,
      });
    });

    it('should open dialog when normal menu button is clicked', () => {
      const menuButton = compiled.querySelector<HTMLButtonElement>('.navbar-mobile__item[mat-button]');

      menuButton?.click();

      expect(dialogMock.open).toHaveBeenCalledWith(NavbarMobileDialogComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        panelClass: PanelClass.ApiWrapperDialog,
        autoFocus: false,
      });
    });

    it('should open dialog when simplified menu button is clicked', () => {
      store.overrideSelector(selectUrlState, {
        isSimplifiedPage: true,
      } as UrlState);
      store.refreshState();

      fixture.detectChanges();

      const menuButton = compiled.querySelector<HTMLButtonElement>('.navbar-mobile-simplified__button');

      menuButton?.click();

      expect(dialogMock.open).toHaveBeenCalledWith(NavbarMobileDialogComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '100%',
        width: '100%',
        panelClass: PanelClass.ApiWrapperDialog,
        autoFocus: false,
      });
    });
  });
});
