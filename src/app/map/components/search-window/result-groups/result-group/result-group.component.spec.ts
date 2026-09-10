import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Mock, vi} from 'vitest';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectMapConfigState} from '../../../../../state/map/reducers/map-config.reducer';
import {SearchActions} from '../../../../../state/app/actions/search.actions';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {ResultGroupComponent} from './result-group.component';
import {ExpandableListItemComponent} from '../../../../../shared/components/expandable-list-item/expandable-list-item.component';
import {Map} from '../../../../../shared/interfaces/topic.interface';
import {GeometryWithSrsSearchApiResultMatch} from '../../../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {MapConstants} from '../../../../../shared/constants/map.constants';
import {ActiveMapItemFactory} from '../../../../../shared/factories/active-map-item.factory';

describe('ResultGroupComponent', () => {
  let component: ResultGroupComponent;
  let fixture: ComponentFixture<ResultGroupComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const searchResults = signal<GeometryWithSrsSearchApiResultMatch[]>([]);
  const filteredMaps = signal<Map[]>([]);
  const header = signal<string | undefined>(undefined);
  const searchTerms = signal<string[]>([]);
  const isExpanded = signal<boolean | undefined>(undefined);

  const searchResult: GeometryWithSrsSearchApiResultMatch = {
    displayString: 'Test result',
    indexType: 'places',
    indexName: 'Test index',
    geometry: {
      type: 'Point',
      coordinates: [1, 1],
      srs: 2056,
    },
    score: 0,
  };

  const activeMapSearchResult = {
    displayString: 'Active map result',
    indexType: 'activeMapItems',
    indexName: 'Active map',
  } as GeometryWithSrsSearchApiResultMatch;

  const externalMap = {
    title: 'External map',
    printTitle: 'External map',
    icon: 'map-icon.svg',
    gb2Url: 'https://example.com/map',
  } as Map;

  const temporaryMap: Map = {
    id: 'yes',
    uuid: 'yes',
    organisation: 'yes',
    keywords: [],
    wmsUrl: 'https://example.com/wms',
    layers: [],
    minScale: 1,
    notice: null,
    opacity: 1,
    timeSliderConfiguration: undefined,
    initialTimeSliderExtent: undefined,
    title: 'Temporary map',
    printTitle: 'Temporary map',
    icon: 'map-icon.svg',
    gb2Url: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultGroupComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectMapConfigState, {
      isMapServiceInitialized: false,
      center: {x: 0, y: 0},
      scale: 0,
      rotation: 0,
      srsId: 2056,
      ready: false,
      scaleSettings: {
        minScale: 0,
        maxScale: 0,
        calculatedMinScale: 0,
        calculatedMaxScale: 0,
      },
      isMaxZoomedIn: false,
      isMaxZoomedOut: false,
      activeBasemapId: '',
      initialMaps: [],
      predefinedInitialExtent: false,
      initialMapPadding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      initialMapPaddingMobile: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      initialBoundingBox: {
        min: {
          x: 0,
          y: 0,
        },
        max: {
          x: 0,
          y: 0,
        },
      },
      referenceDistanceInMeters: undefined,
    });
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    searchResults.set([]);
    filteredMaps.set([]);
    header.set(undefined);
    searchTerms.set([]);
    isExpanded.set(undefined);

    fixture = TestBed.createComponent(ResultGroupComponent, {
      bindings: [
        inputBinding('searchResults', searchResults),
        inputBinding('filteredMaps', filteredMaps),
        inputBinding('header', header),
        inputBinding('searchTerms', searchTerms),
        inputBinding('isExpanded', isExpanded),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the expandable list item with the header and item count', () => {
    header.set('Test header');
    searchResults.set([searchResult]);
    fixture.detectChanges();

    const expandableListItem = fixture.debugElement.query(By.directive(ExpandableListItemComponent));

    expect(expandableListItem.componentInstance.header()).toBe('Test header');
    expect(expandableListItem.componentInstance.numberOfItems()).toBe(1);
    expect(expandableListItem.componentInstance.showBadge()).toBe(true);
    expect(expandableListItem.componentInstance.allowTabFocus()).toBe(false);
  });

  it('should use the filtered map count when filtered maps are available', () => {
    filteredMaps.set([externalMap, temporaryMap]);
    fixture.detectChanges();

    const expandableListItem = fixture.debugElement.query(By.directive(ExpandableListItemComponent));

    expect(expandableListItem.componentInstance.numberOfItems()).toBe(2);
  });

  it('should use the search result count when there are no filtered maps', () => {
    searchResults.set([searchResult, activeMapSearchResult]);
    fixture.detectChanges();

    const expandableListItem = fixture.debugElement.query(By.directive(ExpandableListItemComponent));

    expect(expandableListItem.componentInstance.numberOfItems()).toBe(2);
  });

  it('should expand the group when screen mode is regular', () => {
    isExpanded.set(false);
    fixture.detectChanges();

    const expandableListItem = fixture.debugElement.query(By.directive(ExpandableListItemComponent));

    expect(expandableListItem.componentInstance.expanded()).toBe(true);
  });

  it('should use isExpanded when screen mode is mobile', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    isExpanded.set(false);
    fixture.detectChanges();

    const expandableListItem = fixture.debugElement.query(By.directive(ExpandableListItemComponent));

    expect(expandableListItem.componentInstance.expanded()).toBe(false);

    isExpanded.set(true);
    fixture.detectChanges();

    expect(expandableListItem.componentInstance.expanded()).toBe(true);
  });

  it('should add the mobile class in mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const containers = compiled.querySelectorAll('.result-group__container');

    expect(containers).toHaveLength(2);
    expect(Array.from(containers).every((container) => container.classList.contains('result-group__container--mobile'))).toBe(true);
  });

  it('should not add the mobile class in regular screen mode', () => {
    const containers = compiled.querySelectorAll('.result-group__container');

    expect(containers).toHaveLength(2);
    expect(Array.from(containers).every((container) => !container.classList.contains('result-group__container--mobile'))).toBe(true);
  });

  it('should render search results', () => {
    searchResults.set([searchResult, activeMapSearchResult]);
    fixture.detectChanges();

    const items = compiled.querySelectorAll('.result-group-list__list-item');

    expect(items).toHaveLength(2);
    expect(compiled.textContent).toContain('Test result');
    expect(compiled.textContent).toContain('Active map result');
  });

  it('should render the index name only for active map search results', () => {
    searchResults.set([searchResult, activeMapSearchResult]);
    fixture.detectChanges();

    const headers = compiled.querySelectorAll('.result-group__container__element__header');

    expect(headers).toHaveLength(1);
    expect(headers[0].textContent?.trim()).toBe('Active map');
  });

  it('should make only the first search result keyboard focusable', () => {
    searchResults.set([searchResult, activeMapSearchResult]);
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.search-result-group__container__element--interactive');

    expect(buttons).toHaveLength(2);
    expect(buttons[0].tabIndex).toBe(0);
    expect(buttons[1].tabIndex).toBe(-1);
  });

  it('should dispatch selectMapSearchResult when a search result is clicked', () => {
    searchResults.set([searchResult]);
    fixture.detectChanges();

    const button = compiled.querySelector<HTMLButtonElement>('.search-result-group__container__element--interactive');

    button!.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.selectMapSearchResult({searchResult}));
  });

  it('should render external maps as links', () => {
    filteredMaps.set([externalMap]);
    fixture.detectChanges();

    const link = compiled.querySelector<HTMLAnchorElement>('.result-group__container__element__link');

    expect(link).toBeTruthy();
    expect(link?.href).toContain('https://example.com/map');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toContain('noopener');
    expect(link?.tabIndex).toBe(0);
    expect(link?.textContent).toContain('External map');
  });

  it('should make only the first map keyboard focusable', () => {
    filteredMaps.set([externalMap, {...externalMap, title: 'Second map'} as Map]);
    fixture.detectChanges();

    const links = compiled.querySelectorAll<HTMLAnchorElement>('.result-group__container__element__link');

    expect(links[0].tabIndex).toBe(0);
    expect(links[1].tabIndex).toBe(-1);
  });

  it('should render the map icon and title for external maps', () => {
    filteredMaps.set([externalMap]);
    fixture.detectChanges();

    const image = compiled.querySelector<HTMLImageElement>('.result-group__container__element__map-content__image');

    expect(image?.src).toContain('map-icon.svg');
    expect(image?.alt).toBe('External map');
    expect(compiled.textContent).toContain('External map');
  });

  it('should render maps without a gb2Url as buttons', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const button = compiled.querySelector<HTMLButtonElement>('.result-group__container__element__button');

    expect(button).toBeTruthy();
    expect(button?.tabIndex).toBe(0);
    expect(button?.getAttribute('data-index')).toBe('0');
    expect(button?.textContent).toContain('Temporary map');
  });

  it('should use the configured hover delay for map buttons', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.result-group__container__element__button'));

    expect(button.componentInstance.hoverDelay).toBe(MapConstants.TEMPORARY_PREVIEW_DELAY);
  });

  it('should add a temporary map when delayed mouse enter occurs', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const addActiveMapSpy = vi.spyOn(component, 'addActiveMap');

    const button = compiled.querySelector<HTMLButtonElement>('.result-group__container__element__button');

    button?.dispatchEvent(new MouseEvent('delayedMouseEnter'));
    fixture.detectChanges();

    expect(addActiveMapSpy).toHaveBeenCalledWith(temporaryMap, true);
  });

  it('should remove a temporary map when mouse leaves', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const removeTemporaryMapSpy = vi.spyOn(component, 'removeTemporaryMap');

    const button = compiled.querySelector<HTMLButtonElement>('.result-group__container__element__button');

    button?.dispatchEvent(new MouseEvent('mouseleave'));

    expect(removeTemporaryMapSpy).toHaveBeenCalledWith(temporaryMap);
  });

  it('should add a map when a map button is clicked', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const addActiveMapSpy = vi.spyOn(component, 'addActiveMap');

    const button = compiled.querySelector<HTMLButtonElement>('.result-group__container__element__button');

    button?.click();

    expect(addActiveMapSpy).toHaveBeenCalledWith(temporaryMap);
  });

  it('should add a temporary map from arrow navigation', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const addActiveMapSpy = vi.spyOn(component, 'addActiveMap');

    const button = fixture.debugElement.query(By.css('.result-group__container__element__button'));

    button.triggerEventHandler('addResultFromArrowNavigation', undefined);

    expect(addActiveMapSpy).toHaveBeenCalledWith(temporaryMap, true);
  });

  it('should remove a temporary map from arrow navigation', () => {
    filteredMaps.set([temporaryMap]);
    fixture.detectChanges();

    const removeTemporaryMapSpy = vi.spyOn(component, 'removeTemporaryMap');

    const button = fixture.debugElement.query(By.css('.result-group__container__element__button'));

    button.triggerEventHandler('removeResultFromArrowNavigation', undefined);

    expect(removeTemporaryMapSpy).toHaveBeenCalledWith(temporaryMap);
  });

  it('should set the correct data index for map buttons', () => {
    const secondMap = {...temporaryMap, title: 'Second map'} as Map;

    filteredMaps.set([temporaryMap, secondMap]);
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.result-group__container__element__button');

    expect(buttons[0].getAttribute('data-index')).toBe('0');
    expect(buttons[1].getAttribute('data-index')).toBe('1');
  });

  it('should add a map item when addActiveMap is called for a map without gb2Url', () => {
    component.addActiveMap(temporaryMap);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.addActiveMapItem({
        activeMapItem: ActiveMapItemFactory.createGb2WmsMapItem(temporaryMap),
        position: 0,
      }),
    );
  });

  it('should add a temporary map item when addActiveMap is called with isTemporary', () => {
    component.addActiveMap(temporaryMap, true);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.addActiveMapItem({
        activeMapItem: ActiveMapItemFactory.createTemporaryGb2WmsMapItem(temporaryMap),
        position: 0,
      }),
    );
  });

  it('should not add a map item when addActiveMap is called for a map with gb2Url', () => {
    component.addActiveMap(externalMap);

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should remove a temporary map when removeTemporaryMap is called for a map without gb2Url', () => {
    component.removeTemporaryMap(temporaryMap);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.removeTemporaryActiveMapItem({
        activeMapItem: ActiveMapItemFactory.createTemporaryGb2WmsMapItem(temporaryMap),
      }),
    );
  });

  it('should not remove a temporary map when removeTemporaryMap is called for a map with gb2Url', () => {
    component.removeTemporaryMap(externalMap);

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should expose rendered search result elements through viewChildren', () => {
    searchResults.set([searchResult, activeMapSearchResult]);
    fixture.detectChanges();

    expect(component.searchResultElements()).toHaveLength(2);
  });
});
