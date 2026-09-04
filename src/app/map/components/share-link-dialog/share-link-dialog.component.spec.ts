import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter, Router} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfigService} from 'src/app/shared/services/config.service';
import {selectId, selectSavingState} from '../../../state/map/reducers/share-link.reducer';
import {ShareLinkDialogComponent} from './share-link-dialog.component';

describe('ShareLinkDialogComponent', () => {
  let component: ShareLinkDialogComponent;
  let fixture: ComponentFixture<ShareLinkDialogComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let router: Router;

  const dialogRefMock: Partial<MatDialogRef<ShareLinkDialogComponent>> = {
    close: vi.fn(),
  };

  const configServiceMock: Partial<ConfigService> = {
    embeddedMapConfig: {
      title: 'Test map',
      width: 800,
      height: 600,
      borderSize: 1,
    },
    featureFlags: {
      iframeShareLink: true,
      oerebExtract: false,
      ownershipInformation: false,
      koPlaNavItem: false,
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ShareLinkDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: ConfigService, useValue: configServiceMock},
        provideMockStore(),
        provideRouter([]),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);

    store.overrideSelector(selectSavingState, undefined);
    store.overrideSelector(selectId, undefined);
    store.refreshState();

    fixture = TestBed.createComponent(ShareLinkDialogComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('shareLinkUrl', () => {
    it('should show a loading message when no share link ID exists', () => {
      store.overrideSelector(selectId, undefined);
      store.refreshState();

      expect(component.shareLinkUrl()).toBe('Generiere Link...');
    });

    it('should generate the share link URL when an ID exists', () => {
      store.overrideSelector(selectId, 'abc123');
      store.refreshState();

      expect(component.shareLinkUrl()).toBe(`${globalThis.location.origin}/s/abc123`);
    });

    it('should update the share link URL when the selector value changes', () => {
      store.overrideSelector(selectId, 'first-id');
      store.refreshState();

      expect(component.shareLinkUrl()).toContain('first-id');

      store.overrideSelector(selectId, 'second-id');
      store.refreshState();

      expect(component.shareLinkUrl()).toContain('second-id');
    });
  });

  describe('iframeCode', () => {
    it('should show a loading message when no share link ID exists', () => {
      store.overrideSelector(selectId, undefined);
      store.refreshState();

      expect(component.iframeCode()).toBe('Generiere iframe Code zum einbetten...');
    });

    it('should generate iframe code when an ID exists', () => {
      store.overrideSelector(selectId, 'abc123');
      store.refreshState();

      expect(component.iframeCode()).toBe(
        `<iframe src='${globalThis.location.origin}/e/abc123' title="Test map" width='800' height='600' style='border:1'></iframe>`,
      );
    });

    it('should update the iframe code when the selector value changes', () => {
      store.overrideSelector(selectId, 'first-id');
      store.refreshState();

      expect(component.iframeCode()).toContain('/e/first-id');

      store.overrideSelector(selectId, 'second-id');
      store.refreshState();

      expect(component.iframeCode()).toContain('/e/second-id');
    });
  });

  describe('close', () => {
    it('should close the dialog without an aborted value by default', () => {
      component.close();

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should close the dialog with the provided aborted value', () => {
      component.close(true);

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    });

    it('should close the dialog with false when explicitly passed false', () => {
      component.close(false);

      expect(dialogRefMock.close).toHaveBeenCalledOnce();
      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });
  });

  describe('template', () => {
    it('should render the share link input', () => {
      const input = compiled.querySelector('input[matInput]') as HTMLInputElement;

      expect(input).toBeTruthy();
      expect(input.value).toBe('Generiere Link...');
      expect(input.readOnly).toBe(true);
    });

    it('should disable the share link input while saving state is not loaded', () => {
      store.overrideSelector(selectSavingState, 'loading');
      store.refreshState();
      fixture.detectChanges();

      const input = compiled.querySelector('input[matInput]') as HTMLInputElement;

      expect(input.disabled).toBe(true);
    });

    it('should enable the share link input when saving state is loaded', () => {
      store.overrideSelector(selectSavingState, 'loaded');
      store.refreshState();
      fixture.detectChanges();

      const input = compiled.querySelector('input[matInput]') as HTMLInputElement;

      expect(input.disabled).toBe(false);
    });

    it('should render the generated share link in the input', () => {
      store.overrideSelector(selectSavingState, 'loaded');
      store.overrideSelector(selectId, 'abc123');
      store.refreshState();
      fixture.detectChanges();

      const input = compiled.querySelector('input[matInput]') as HTMLInputElement;

      expect(input.value).toBe(`${globalThis.location.origin}/s/abc123`);
    });

    it('should render the copy button for the share link', () => {
      const buttons = compiled.querySelectorAll('button[aria-label="Kopieren"]');

      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('should disable copy buttons while saving state is not loaded', () => {
      store.overrideSelector(selectSavingState, 'loading');
      store.refreshState();
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll<HTMLButtonElement>('button[aria-label="Kopieren"]');

      expect(buttons[0].disabled).toBe(true);
    });

    it('should enable the share link copy button when saving state is loaded', () => {
      store.overrideSelector(selectSavingState, 'loaded');
      store.refreshState();
      fixture.detectChanges();

      const button = compiled.querySelector<HTMLButtonElement>('mat-form-field button[aria-label="Kopieren"]');

      expect(button?.disabled).toBe(false);
    });

    it('should render the close button', () => {
      const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find((element) =>
        element.textContent?.includes('Schliessen'),
      );

      expect(button).toBeTruthy();
    });

    it('should close the dialog when the close button is clicked', () => {
      const button = Array.from(compiled.querySelectorAll<HTMLButtonElement>('button')).find((element) =>
        element.textContent?.includes('Schliessen'),
      );

      expect(button).toBeTruthy();

      button?.click();

      expect(dialogRefMock.close).toHaveBeenCalledWith(false);
    });

    it('should update the share link input when the share link ID changes', () => {
      store.overrideSelector(selectSavingState, 'loaded');
      store.overrideSelector(selectId, 'first-id');
      store.refreshState();
      fixture.detectChanges();

      const input = compiled.querySelector('mat-form-field input[matInput]') as HTMLInputElement;

      expect(input.value).toContain('first-id');

      store.overrideSelector(selectId, 'second-id');
      store.refreshState();
      fixture.detectChanges();

      expect(input.value).toContain('second-id');
    });
  });

  describe('router URL generation', () => {
    it('should create the share link URL using the router', () => {
      const createUrlTreeSpy = vi.spyOn(router, 'createUrlTree');

      store.overrideSelector(selectId, 'abc123');
      store.refreshState();

      component.shareLinkUrl();

      expect(createUrlTreeSpy).toHaveBeenCalledWith(expect.arrayContaining(['abc123']));
    });

    it('should create the embedded URL using the router', () => {
      const createUrlTreeSpy = vi.spyOn(router, 'createUrlTree');

      store.overrideSelector(selectId, 'abc123');
      store.refreshState();

      component.iframeCode();

      expect(createUrlTreeSpy).toHaveBeenCalledWith(expect.arrayContaining(['abc123']));
    });
  });
});
