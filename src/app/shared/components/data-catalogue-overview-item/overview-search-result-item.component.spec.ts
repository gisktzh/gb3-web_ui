import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {OverviewSearchResultItemComponent} from './overview-search-result-item.component';
import {inputBinding, signal} from '@angular/core';
import {OverviewSearchResultDisplayItem} from '../../interfaces/overview-search-resuilt-display.interface';
import {OverviewSearchResultType} from '../../types/overview-search-result.type';
import {provideRouter} from '@angular/router';

describe('OverviewSearchResultItemComponent', () => {
  let component: OverviewSearchResultItemComponent;
  let fixture: ComponentFixture<OverviewSearchResultItemComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

  const item = signal<OverviewSearchResultDisplayItem>({
    title: 'Test title',
    type: 'Geodatensatz',
    url: {
      isInternal: true,
      path: '/test-path',
    },
    flags: {
      ogd: true,
    },
    fields: [],
    uuid: 'asdf-1234',
  });

  const canFocusWithTabKey = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewSearchResultItemComponent],
      providers: [provideMockStore(), provideRouter([])],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();

    fixture = TestBed.createComponent(OverviewSearchResultItemComponent, {
      bindings: [inputBinding('item', item), inputBinding('canFocusWithTabKey', canFocusWithTabKey)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render internal link with router link and tab focus enabled', () => {
    canFocusWithTabKey.set(true);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.overview-search-result-item');

    expect(link?.getAttribute('tabindex')).toBe('0');
    expect(link?.getAttribute('href')).toBe('/test-path');
  });

  it('should render external link with href and disabled tab focus', () => {
    item.set({
      ...item(),
      url: {
        isInternal: false,
        path: 'https://example.com',
      },
    });
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.overview-search-result-item');

    expect(link?.getAttribute('href')).toBe('https://example.com');
    expect(link?.getAttribute('tabindex')).toBe('-1');
  });

  it('should render icon for dataset type', () => {
    const icon = compiled.querySelector<HTMLElement>('.overview-search-result-item__icon mat-icon');

    expect(icon?.getAttribute('data-mat-icon-name')).toBe('ktzh_search_dataset');
  });

  it('should hide icon on mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const icon = compiled.querySelector<HTMLElement>('.overview-search-result-item__icon');

    expect(icon).toBeNull();
  });

  it('should render ogd lock icon when item is not ogd', () => {
    item.set({
      ...item(),
      flags: {
        ogd: false,
      },
    });
    fixture.detectChanges();

    const lockIcon = compiled.querySelector<HTMLElement>('.overview-search-result-item__content__title__flag mat-icon');

    expect(lockIcon).toBeTruthy();
  });

  it('should render fields with titles when multiple fields exist', () => {
    item.set({
      ...item(),
      fields: [
        {
          title: 'Field one',
          content: 'Value one',
          truncatable: false,
        },
        {
          title: 'Field two',
          content: 'Value two',
          truncatable: true,
        },
      ],
    });
    fixture.detectChanges();

    const fieldTitles = compiled.querySelectorAll<HTMLElement>('.overview-search-result-item__content__details__item__title');

    expect(fieldTitles.length).toBe(2);

    const truncatedField = Array.from(compiled.querySelectorAll<HTMLElement>('.overview-search-result-item__content__details__item'))[1];

    expect(truncatedField?.classList).toContain('overview-search-result-item__content__details__item--truncated');
  });

  it('should not render field titles for a single field', () => {
    item.set({
      ...item(),
      fields: [
        {
          title: 'Field',
          content: 'Value',
          truncatable: false,
        },
      ],
    });
    fixture.detectChanges();

    const fieldTitle = compiled.querySelector<HTMLElement>('.overview-search-result-item__content__details__item__title');

    expect(fieldTitle).toBeNull();
  });

  it('should rotate arrow icon for external links', () => {
    item.set({
      ...item(),
      url: {
        isInternal: false,
        path: 'https://example.com',
      },
    });
    fixture.detectChanges();

    const arrowIcon = compiled.querySelector<HTMLElement>('.search-result-entry-map__icon');

    expect(arrowIcon?.classList).toContain('search-result-entry-map__icon--rotate');
  });

  it.each([
    {type: 'Produkt', icon: 'ktzh_search_product'},
    {type: 'Karte', icon: 'ktzh_search_map'},
    {type: 'Geoservice', icon: 'ktzh_search_service'},
    {type: 'Frage', icon: 'ktzh_search_faq'},
    {type: 'Info', icon: 'ktzh_search_helpful_information'},
  ])('should render correct icon for %s', (typeIconPair) => {
    item.set({
      ...item(),
      type: typeIconPair.type as OverviewSearchResultType,
    });
    fixture.detectChanges();

    const icon = compiled.querySelector<HTMLElement>('.overview-search-result-item__icon mat-icon');

    expect(icon?.getAttribute('data-mat-icon-name')).toBe(typeIconPair.icon);
  });
});
