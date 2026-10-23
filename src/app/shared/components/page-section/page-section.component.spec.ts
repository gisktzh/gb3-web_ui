import {Component, inputBinding, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {PageSectionComponent, TitleLink} from './page-section.component';

describe('PageSectionComponent', () => {
  let fixture: ComponentFixture<PageSectionComponent>;
  let element: HTMLElement;
  let store: MockStore;

  const background = signal<'primary' | 'accent' | undefined>(undefined);
  const sectionTitle = signal<string | undefined>(undefined);
  const titleLink = signal<TitleLink | undefined>(undefined);
  const pageTitle = signal(false);

  beforeEach(async () => {
    background.set(undefined);
    sectionTitle.set(undefined);
    titleLink.set(undefined);
    pageTitle.set(false);

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
        inputBinding('pageTitle', pageTitle),
      ],
    });
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('labels and visually distinguishes a titled accent section', () => {
    background.set('accent');
    sectionTitle.set('Available maps');
    fixture.detectChanges();

    const section = element.querySelector('section');

    expect(section?.classList).toContain('page-section__accent');
    expect(section?.getAttribute('aria-label')).toBe('Available maps');
    expect(element.querySelector('h2')?.textContent).toContain('Available maps');
  });

  it('omits the title region when no section title is supplied', () => {
    expect(element.querySelector('h2')).toBeNull();
    expect(element.querySelector('.page-section__content-container__title-wrapper')).toBeNull();
  });

  it('renders a safe external title link', () => {
    sectionTitle.set('Help');
    titleLink.set({url: 'https://example.com/help', displayTitle: 'Open help'});
    fixture.detectChanges();

    const link = element.querySelector<HTMLAnchorElement>('a');

    expect(link?.textContent).toContain('Open help');
    expect(link?.getAttribute('href')).toBe('https://example.com/help');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
  });

  it('uses the mobile layout except when the section is the page title', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const section = element.querySelector('section');
    expect(section?.classList).toContain('page-section--mobile');

    pageTitle.set(true);
    fixture.detectChanges();

    expect(section?.classList).not.toContain('page-section--mobile');
  });

  it('projects consumer content', () => {
    @Component({
      imports: [PageSectionComponent],
      template: '<page-section><p class="consumer-content">Projected content</p></page-section>',
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);
    hostFixture.detectChanges();

    expect((hostFixture.nativeElement as HTMLElement).querySelector('.consumer-content')?.textContent).toBe('Projected content');
  });
});
