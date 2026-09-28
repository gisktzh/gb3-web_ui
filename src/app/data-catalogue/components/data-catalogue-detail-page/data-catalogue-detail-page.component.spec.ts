import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {DataCatalogueDetailPageComponent} from './data-catalogue-detail-page.component';

describe('DataCatalogueDetailPageComponent', () => {
  let fixture: ComponentFixture<DataCatalogueDetailPageComponent>;
  let element: HTMLElement;
  let store: MockStore;

  const metadata: BaseMetadataInformation = {
    itemTitle: 'Municipal boundaries',
    category: 'Geodatensatz',
    imageUrl: null,
    shortDescription: undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCatalogueDetailPageComponent],
      providers: [provideMockStore({selectors: [{selector: selectScreenMode, value: 'regular'}]}), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DataCatalogueDetailPageComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput('baseMetadataInformation', metadata);
    fixture.detectChanges();
  });

  it('renders the title, category and overview navigation', () => {
    expect(element.querySelector('h1')?.textContent?.trim()).toBe('Municipal boundaries');
    expect(element.querySelector('.data-catalogue-detail-page__category__content')?.textContent).toContain('Geodatensatz');
    expect(element.querySelector('.data-catalogue-detail-page__back-button')?.textContent).toContain('Zur Übersicht');
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector('.data-catalogue-detail-page__description')).toBeNull();
  });

  it('renders optional image and formatted description metadata', () => {
    fixture.componentRef.setInput('baseMetadataInformation', {
      ...metadata,
      shortDescription: 'First line\nSecond line',
      imageUrl: {
        src: {href: 'https://example.com/image.png', title: 'Image'},
        url: {href: 'https://example.com/details', title: 'Details'},
        alt: 'Map preview',
      },
    } satisfies BaseMetadataInformation);
    fixture.detectChanges();

    const imageLink = element.querySelector<HTMLAnchorElement>('.data-catalogue-detail-page__title > a');
    const image = imageLink?.querySelector('img');
    expect(imageLink?.getAttribute('href')).toBe('https://example.com/details');
    expect(image?.getAttribute('src')).toBe('https://example.com/image.png');
    expect(image?.getAttribute('alt')).toBe('Map preview');
    expect(element.querySelector('.data-catalogue-detail-page__description')?.innerHTML).toContain('<br>');
  });

  it('applies the compact layout in mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(
      element
        .querySelector('.data-catalogue-detail-page__back-button')
        ?.classList.contains('data-catalogue-detail-page__back-button--mobile'),
    ).toBe(true);
    expect(
      element.querySelector('.data-catalogue-detail-page__title')?.classList.contains('data-catalogue-detail-page__title--mobile'),
    ).toBe(true);
  });
});
