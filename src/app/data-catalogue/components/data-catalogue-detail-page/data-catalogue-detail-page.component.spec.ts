import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataCatalogueDetailPageComponent} from './data-catalogue-detail-page.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideRouter} from '@angular/router';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

describe('DataCatalogueDetailPageComponent', () => {
  let component: DataCatalogueDetailPageComponent;
  let fixture: ComponentFixture<DataCatalogueDetailPageComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  const args: BaseMetadataInformation = {
    itemTitle: 'Item title',
    category: 'Item description',
    imageUrl: null,
    shortDescription: undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCatalogueDetailPageComponent],
      providers: [provideMockStore({}), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(DataCatalogueDetailPageComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    store = TestBed.inject(MockStore);

    fixture.componentRef.setInput('baseMetadataInformation', args);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(compiled.querySelector('h1')?.textContent.trim()).toBe(args.itemTitle);
  });

  it('should not render an image and short description if none are given', () => {
    expect(compiled.querySelectorAll('img').length).toBe(0);
    expect(compiled.querySelectorAll('a').length).toBe(1);
    expect(compiled.querySelector('h1')?.textContent).toBe(args.itemTitle);
    expect(compiled.querySelector('.data-catalogue-detail-page__description')).toBeNull();
  });

  it('should render an image if one is given', () => {
    const updatedArgs: BaseMetadataInformation = {
      ...args,
      imageUrl: {
        src: {
          href: 'https://geo.zh.ch/test-image.jpg',
          title: 'Test image',
        },
        alt: 'Test image',
        url: {
          href: 'https://geo.zh.ch/test-url',
          title: 'Test url',
        },
      },
    };
    fixture.componentRef.setInput('baseMetadataInformation', updatedArgs);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('a').length).toBe(2);

    const imageLink = compiled.querySelectorAll('a')[1];
    expect(imageLink).not.toBeNull();
    expect(imageLink?.getAttribute('href')).toBe(updatedArgs.imageUrl!.url.href);
    expect(imageLink?.getAttribute('title')).toBe(updatedArgs.imageUrl!.url.title);

    const image = imageLink.querySelector('img');
    expect(image).not.toBeNull();
    expect(image?.getAttribute('src')).toBe(updatedArgs.imageUrl!.src.href);
    expect(image?.getAttribute('alt')).toBe(updatedArgs.imageUrl!.src.title);
  });

  it('should attach appropriate classes on mobile screens', () => {
    const backButton = compiled.querySelector('.data-catalogue-detail-page__back-button');
    expect(backButton).not.toBeNull();

    const pageTitle = compiled.querySelector('.data-catalogue-detail-page__title');
    expect(pageTitle).not.toBeNull();

    expect(backButton?.classList).not.toContain('data-catalogue-detail-page__back-button--mobile');
    expect(pageTitle?.classList).not.toContain('data-catalogue-detail-page__title--mobile');

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(backButton?.classList).toContain('data-catalogue-detail-page__back-button--mobile');
    expect(pageTitle?.classList).toContain('data-catalogue-detail-page__title--mobile');
  });
});
