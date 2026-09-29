import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ExternalApp} from '../shared/interfaces/external-app.interface';
import {selectExternalAppsForAccessMode} from '../state/external-apps/selectors/external-apps.selector';
import {AppsPageComponent} from './apps-page.component';

describe('AppsPageComponent', () => {
  let fixture: ComponentFixture<AppsPageComponent>;
  let element: HTMLElement;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [AppsPageComponent], providers: [provideMockStore()]}).compileComponents();
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectExternalAppsForAccessMode, []);
    store.refreshState();
    fixture = TestBed.createComponent(AppsPageComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders each app as an accessible image link', () => {
    const app = {
      title: 'Geo app',
      appUrl: 'https://example.com/app',
      image: {url: '/app.png', altText: 'App preview'},
    } as ExternalApp;
    store.overrideSelector(selectExternalAppsForAccessMode, [app]);
    store.refreshState();
    fixture.detectChanges();

    const link = element.querySelector<HTMLAnchorElement>('link-grid-list-item a');
    const image = element.querySelector<HTMLImageElement>('link-grid-list-item img');
    expect(link?.href).toBe(app.appUrl);
    expect(link?.textContent).toContain(app.title);
    expect(image?.getAttribute('src')).toBe(app.image.url);
    expect(image?.alt).toBe(app.image.altText);
  });

  it('keeps an empty app collection empty', () => {
    expect(element.querySelectorAll('link-grid-list-item')).toHaveLength(0);
  });
});
