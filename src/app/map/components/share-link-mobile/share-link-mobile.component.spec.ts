import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Router} from '@angular/router';
import {Mock} from 'vitest';
import {selectId, selectSavingState} from 'src/app/state/map/reducers/share-link.reducer';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {ShareLinkMobileComponent} from './share-link-mobile.component';

describe('ShareLinkMobileComponent', () => {
  let component: ShareLinkMobileComponent;
  let fixture: ComponentFixture<ShareLinkMobileComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let router: Router;
  let createUrlTreeSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareLinkMobileComponent],
      providers: [provideMockStore(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectSavingState, undefined);
    store.overrideSelector(selectId, undefined);
    store.refreshState();

    router = TestBed.inject(Router);
    createUrlTreeSpy = vi.spyOn(router, 'createUrlTree');

    fixture = TestBed.createComponent(ShareLinkMobileComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const title = compiled.querySelector('.share-link-mobile__input__title');

    expect(title?.textContent).toBe('Link auf aktive Karten');
  });

  it('should render a question mark when no share link id exists', () => {
    const input = compiled.querySelector('.share-link-mobile__input__text') as HTMLInputElement;

    expect(component.shareLinkUrl()).toBeUndefined();
    expect(input.value).toBe('?');
  });

  it('should disable the input while saving state is not loaded', () => {
    const input = compiled.querySelector('.share-link-mobile__input__text') as HTMLInputElement;

    expect(input.disabled).toBe(true);
  });

  it('should disable the copy button while saving state is not loaded', () => {
    const button = compiled.querySelector('button') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should render the copy icon and aria label', () => {
    const button = compiled.querySelector('button');

    expect(button?.getAttribute('aria-label')).toBe('Copy');
    expect(button?.querySelector('mat-icon')?.textContent?.trim()).toBe('content_copy');
  });

  it('should pass the current saving state to the loading and process bar', () => {
    const loadingBar = fixture.debugElement.query(By.directive(LoadingAndProcessBarComponent))
      .componentInstance as LoadingAndProcessBarComponent;

    expect(loadingBar.loadingState()).toBeUndefined();
  });

  it('should generate the share link URL when a share link id exists', () => {
    const id = 'abc123';
    const urlTree = router.createUrlTree([MainPage.ShareLink, id]);
    createUrlTreeSpy.mockReturnValue(urlTree);

    store.overrideSelector(selectId, id);
    store.refreshState();
    fixture.detectChanges();

    expect(createUrlTreeSpy).toHaveBeenCalledWith([MainPage.ShareLink, id]);
    expect(component.shareLinkUrl()).toBe(new URL(urlTree.toString(), globalThis.location.origin).toString());
  });

  it('should render the generated share link URL', () => {
    const id = 'abc123';
    const urlTree = router.createUrlTree([MainPage.ShareLink, id]);
    createUrlTreeSpy.mockReturnValue(urlTree);

    store.overrideSelector(selectId, id);
    store.refreshState();
    fixture.detectChanges();

    const input = compiled.querySelector('.share-link-mobile__input__text') as HTMLInputElement;

    expect(input.value).toBe(new URL(urlTree.toString(), globalThis.location.origin).toString());
  });

  it('should enable the input when saving state is loaded', () => {
    store.overrideSelector(selectSavingState, 'loaded');
    store.refreshState();
    fixture.detectChanges();

    const input = compiled.querySelector('.share-link-mobile__input__text') as HTMLInputElement;

    expect(input.disabled).toBe(false);
  });

  it('should enable the copy button when saving state is loaded', () => {
    store.overrideSelector(selectSavingState, 'loaded');
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('button') as HTMLButtonElement;

    expect(button.disabled).toBe(false);
  });

  it('should pass the loaded saving state to the loading and process bar', () => {
    store.overrideSelector(selectSavingState, 'loaded');
    store.refreshState();
    fixture.detectChanges();

    const loadingBar = fixture.debugElement.query(By.directive(LoadingAndProcessBarComponent))
      .componentInstance as LoadingAndProcessBarComponent;

    expect(loadingBar.loadingState()).toBe('loaded');
  });

  it('should update the rendered URL when the share link id changes', () => {
    const firstId = 'first';
    const secondId = 'second';

    const firstUrlTree = router.createUrlTree([MainPage.ShareLink, firstId]);
    const secondUrlTree = router.createUrlTree([MainPage.ShareLink, secondId]);

    createUrlTreeSpy.mockReturnValueOnce(firstUrlTree).mockReturnValueOnce(secondUrlTree);

    store.overrideSelector(selectId, firstId);
    store.refreshState();
    fixture.detectChanges();

    const input = compiled.querySelector('.share-link-mobile__input__text') as HTMLInputElement;

    expect(input.value).toBe(new URL(firstUrlTree.toString(), globalThis.location.origin).toString());

    store.overrideSelector(selectId, secondId);
    store.refreshState();
    fixture.detectChanges();

    expect(input.value).toBe(new URL(secondUrlTree.toString(), globalThis.location.origin).toString());
  });
});
