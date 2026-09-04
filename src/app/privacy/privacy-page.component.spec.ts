import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {PrivacyPageComponent} from './privacy-page.component';

describe('PrivacyPageComponent', () => {
  let component: PrivacyPageComponent;
  let fixture: ComponentFixture<PrivacyPageComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyPageComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(PrivacyPageComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render privacy title', () => {
    const title = compiled.querySelector<HTMLHeadingElement>('h1');

    expect(title?.textContent).toContain('Datenschutz');
  });

  it('should render privacy summary text on regular screen mode', () => {
    expect(compiled.textContent).toContain('In den Informationen und Richtlinien zum Datenschutz');
  });

  it('should not render privacy summary text on mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.textContent).not.toContain('In den Informationen und Richtlinien zum Datenschutz');
  });

  it('should render page sections', () => {
    const sections = compiled.querySelectorAll('page-section');

    expect(sections.length).toBe(2);
  });

  it('should render hero header component', () => {
    const heroHeader = compiled.querySelector('hero-header');

    expect(heroHeader).toBeTruthy();
  });

  it('should render privacy content component', () => {
    const privacyContent = compiled.querySelector('privacy-content');

    expect(privacyContent).toBeTruthy();
  });

  it('should expose hero text', () => {
    expect(component.heroText).toContain('Datenschutz');
  });
});
