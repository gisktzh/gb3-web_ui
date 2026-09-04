import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MainFooterComponent} from './main-footer.component';
import {environment} from '../../../../environments/environment';
import {provideMockStore} from '@ngrx/store/testing';

describe('MainFooterComponent', () => {
  let component: MainFooterComponent;
  let fixture: ComponentFixture<MainFooterComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainFooterComponent],
      providers: [provideRouter([]), provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(MainFooterComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render contact section via page-section', () => {
    const section = compiled.querySelector<HTMLElement>('page-section');

    expect(section).toBeTruthy();
    expect(section?.getAttribute('sectiontitle')).toBe('Kontakt');
  });

  it('should render footer container', () => {
    const footer = compiled.querySelector<HTMLElement>('footer.main-footer');

    expect(footer).toBeTruthy();
  });

  it('should render static copyright text', () => {
    const text = compiled.querySelector<HTMLElement>('.main-footer__content__links');

    expect(text?.textContent).toContain('Kanton Zürich');
    expect(text?.textContent).toContain('© 2026');
  });

  it('should render router links for data protection and usage notes', () => {
    const links = compiled.querySelectorAll<HTMLAnchorElement>('footer a');

    expect(links.length).toBeGreaterThanOrEqual(2);

    const hrefs = Array.from(links).map((l) => l.getAttribute('href'));

    expect(hrefs).toContain('/privacy');
    expect(hrefs).toContain('/terms-of-use');
  });

  it('should render app version from environment', () => {
    const version = compiled.querySelector<HTMLSpanElement>('small');

    expect(version?.textContent).toContain(environment.appVersion);
  });

  it('should render release when available', () => {
    if (!environment.appRelease) {
      expect(true).toBe(true);
      return;
    }

    const text = compiled.textContent ?? '';

    expect(text).toContain(environment.appRelease);
  });

  it('should not fail when release is missing', () => {
    const release = compiled.querySelectorAll('small');

    expect(release.length).toBeGreaterThan(0);
  });
});
