import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {HeroHeaderComponent} from './hero-header.component';
import {inputBinding, signal} from '@angular/core';

describe('HeroHeaderComponent', () => {
  let component: HeroHeaderComponent;
  let fixture: ComponentFixture<HeroHeaderComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const heroTitle = signal<string>('');
  const heroText = signal<string>('');
  const heroSubText = signal<string | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroHeaderComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(HeroHeaderComponent, {
      bindings: [inputBinding('heroTitle', heroTitle), inputBinding('heroText', heroText), inputBinding('heroSubText', heroSubText)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render hero title', () => {
    heroTitle.set('Welcome to Geoportal');

    fixture.detectChanges();

    const title = compiled.querySelector<HTMLHeadingElement>('.ktzh-h1-giant');

    expect(title).toBeTruthy();
    expect(title?.textContent).toContain('Welcome to Geoportal');
  });

  it('should render hero text on regular screen mode', () => {
    heroText.set('Intro text');

    fixture.detectChanges();

    const intro = compiled.querySelector<HTMLParagraphElement>('.hero-header__intro-paragraph');

    expect(intro).toBeTruthy();
    expect(intro?.textContent).toContain('Intro text');
  });

  it('should hide hero text on mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    heroText.set('Intro text');

    fixture.detectChanges();

    expect(compiled.querySelector('.hero-header__intro-paragraph')).toBeFalsy();
  });

  it('should apply mobile class to title on mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    fixture.detectChanges();

    const title = compiled.querySelector<HTMLElement>('.ktzh-h1-giant');

    expect(title?.classList).toContain('ktzh-h1-giant--mobile');
  });

  it('should not apply mobile class to title on regular screen mode', () => {
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture.detectChanges();

    const title = compiled.querySelector<HTMLElement>('.ktzh-h1-giant');

    expect(title?.classList).not.toContain('ktzh-h1-giant--mobile');
  });

  it('should render sub text when provided', () => {
    heroSubText.set('Additional information');

    fixture.detectChanges();

    const subText = compiled.querySelector<HTMLParagraphElement>('.hero-header__intro-paragraph--subtext');

    expect(subText).toBeTruthy();
    expect(subText?.textContent).toContain('Additional information');
  });

  it('should not render sub text when not provided', () => {
    heroSubText.set(undefined);

    fixture.detectChanges();

    expect(compiled.querySelector('.hero-header__intro-paragraph--subtext')).toBeFalsy();
  });

  it('should render logo image with correct attributes', () => {
    const image = compiled.querySelector<HTMLImageElement>('.hero-header__image');

    expect(image).toBeTruthy();
    expect(image?.alt).toBe('Kt. ZH Logo');
    expect(image?.height).toBe(180);
    expect(image?.width).toBe(184);
    expect(image?.getAttribute('aria-hidden')).toBe('true');
  });
});
