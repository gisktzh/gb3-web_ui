import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AppsPageComponent} from './apps-page.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectExternalAppsForAccessMode} from '../state/external-apps/selectors/external-apps.selector';
import {ExternalApp} from '../shared/interfaces/external-app.interface';

describe('AppsPageComponent', () => {
  let component: AppsPageComponent;
  let fixture: ComponentFixture<AppsPageComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const testApps: ExternalApp[] = [
    {
      visibility: 'both',
      title: 'Test App One',
      description: 'The first test app',
      email: 'test-app@zh.ch',
      keywords: ['test', 'app'],
      topic: 'Bauten',
      categories: ['Fachapplikationen'],
      appUrl: 'https://geo.zh.ch/',
      image: {
        url: 'https://geo.zh.ch/test-image-1.jpg',
        altText: 'Test image 1',
      },
      department: 'Test',
    },
    {
      visibility: 'both',
      title: 'Test App Two',
      description: 'The second test app',
      email: 'test-app@zh.ch',
      keywords: ['test', 'app'],
      topic: 'Bauten',
      categories: ['Fachapplikationen'],
      appUrl: 'https://maps.zh.ch/',
      image: {
        url: 'https://geo.zh.ch/test-image-2.jpg',
        altText: 'Test image 2',
      },
      department: 'Test',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsPageComponent],
      providers: [provideMockStore({})],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectExternalAppsForAccessMode, []);
    store.refreshState();

    fixture = TestBed.createComponent(AppsPageComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    store = TestBed.inject(MockStore);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(compiled.querySelector('hero-header h1')?.innerHTML.trim()).toBe('Apps');
  });

  it('should not render any items if list of apps is empty', () => {
    const linkGridList = compiled.querySelector('link-grid-list');
    expect(linkGridList).toBeTruthy();
    expect(linkGridList?.querySelector('ul')?.textContent).toBe('');
  });

  it('should render a link-grid-list-item for every app', async () => {
    vi.useFakeTimers();
    store.overrideSelector(selectExternalAppsForAccessMode, testApps);
    store.refreshState();

    await vi.runAllTimersAsync();

    const linkGridListItems = compiled.querySelectorAll('link-grid-list-item');
    expect(linkGridListItems.length).toBe(2);

    expect(linkGridListItems[0].textContent).toBe(testApps[0].title);
    expect(linkGridListItems[0].querySelector('a')?.getAttribute('href')).toBe(testApps[0].appUrl);
    expect(linkGridListItems[0].querySelector('img')?.getAttribute('src')).toBe(testApps[0].image.url);
    expect(linkGridListItems[0].querySelector('img')?.getAttribute('alt')).toBe(testApps[0].image.altText);

    expect(linkGridListItems[1].textContent).toBe(testApps[1].title);
    expect(linkGridListItems[1].querySelector('a')?.getAttribute('href')).toBe(testApps[1].appUrl);
    expect(linkGridListItems[1].querySelector('img')?.getAttribute('src')).toBe(testApps[1].image.url);
    expect(linkGridListItems[1].querySelector('img')?.getAttribute('alt')).toBe(testApps[1].image.altText);
  });
});
