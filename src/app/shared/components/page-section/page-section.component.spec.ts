import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {PageSectionComponent, TitleLink} from './page-section.component';
import {Component, inputBinding, signal} from '@angular/core';

describe('PageSectionComponent', () => {
  let component: PageSectionComponent;
  let fixture: ComponentFixture<PageSectionComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const background = signal<'primary' | 'accent' | undefined>(undefined);
  const sectionTitle = signal<string>('');
  const titleLink = signal<TitleLink | undefined>(undefined);
  const hideBottomPadding = signal<boolean>(false);
  const pageTitle = signal<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageSectionComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(PageSectionComponent, {
      bindings: [
        inputBinding('background', background),
        inputBinding('sectionTitle', sectionTitle),
        inputBinding('titleLink', titleLink),
        inputBinding('hideBottomPadding', hideBottomPadding),
        inputBinding('pageTitle', pageTitle),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('background classes', () => {
    it('should apply primary background class', () => {
      background.set('primary');
      fixture.detectChanges();

      const section = compiled.querySelector<HTMLElement>('section');

      expect(section?.classList).toContain('page-section__primary');
    });

    it('should apply accent background class', () => {
      background.set('accent');
      fixture.detectChanges();

      const section = compiled.querySelector<HTMLElement>('section');

      expect(section?.classList).toContain('page-section__accent');
    });
  });

  describe('mobile behavior', () => {
    it('should apply mobile class when screen is mobile and not page title', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();

      pageTitle.set(false);
      fixture.detectChanges();

      const section = compiled.querySelector<HTMLElement>('section');

      expect(section?.classList).toContain('page-section--mobile');
    });

    it('should not apply mobile class when pageTitle is true', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();

      pageTitle.set(true);
      fixture.detectChanges();

      const section = compiled.querySelector<HTMLElement>('section');

      expect(section?.classList).not.toContain('page-section--mobile');
    });
  });

  describe('section title rendering', () => {
    it('should render section title', () => {
      sectionTitle.set('My Section');
      fixture.detectChanges();

      const title = compiled.querySelector<HTMLHeadingElement>('h2');

      expect(title).toBeTruthy();
      expect(title?.textContent).toContain('My Section');
    });

    it('should set aria-label from section title', () => {
      sectionTitle.set('Accessible Title');
      fixture.detectChanges();

      const section = compiled.querySelector<HTMLElement>('section');

      expect(section?.getAttribute('aria-label')).toBe('Accessible Title');
    });

    it('should not render title block when sectionTitle is empty', () => {
      sectionTitle.set('');
      fixture.detectChanges();

      expect(compiled.querySelector('h2')).toBeFalsy();
    });
  });

  describe('title link', () => {
    it('should render external title link when provided', () => {
      const link: TitleLink = {
        url: 'https://example.com',
        displayTitle: 'Example Link',
      };

      titleLink.set(link);
      sectionTitle.set('With Link');

      fixture.detectChanges();

      const anchor = compiled.querySelector<HTMLAnchorElement>('a');

      expect(anchor).toBeTruthy();
      expect(anchor?.href).toContain('https://example.com');
      expect(anchor?.title).toBe('Example Link');
      expect(anchor?.textContent).toContain('Example Link');
      expect(anchor?.target).toBe('_blank');
      expect(anchor?.rel).toBe('noopener noreferrer');
    });

    it('should not render link when titleLink is undefined', () => {
      titleLink.set(undefined);
      fixture.detectChanges();

      const anchor = compiled.querySelector<HTMLAnchorElement>('a');

      expect(anchor).toBeFalsy();
    });
  });

  describe('content projection', () => {
    it('should render projected content', () => {
      @Component({
        template: `
          <page-section sectionTitle="Test">
            <div class="projected-content">Hello content</div>
          </page-section>
        `,
        imports: [PageSectionComponent],
      })
      class HostComponent {}

      const hostFixture = TestBed.createComponent(HostComponent);

      hostFixture.detectChanges();

      const hostElement = hostFixture.nativeElement as HTMLElement;

      const projected = hostElement.querySelector<HTMLDivElement>('.projected-content');

      expect(projected).toBeTruthy();
      expect(projected?.textContent).toContain('Hello content');
    });
  });
});
