import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock, vi} from 'vitest';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectFilterGroups, selectSelectedSearchResult, selectTerm} from '../../../state/app/reducers/search.reducer';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchBarComponent} from '../../../shared/components/search/search-bar/search-bar.component';
import {ResultGroupsComponent} from './result-groups/result-groups.component';
import {SearchWindowComponent} from './search-window.component';
import {GeometryWithSrsSearchApiResultMatch} from 'src/app/shared/services/apis/search/interfaces/search-api-result-match.interface';
import {SearchFilterGroup} from 'src/app/shared/interfaces/search-filter-group.interface';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {selectMaps} from 'src/app/state/map/selectors/maps.selector';
import {selectActiveMapItemState} from 'src/app/state/map/reducers/active-map-item.reducer';
import {selectFilteredSearchApiResultMatches} from 'src/app/state/app/selectors/search-results.selector';

describe('SearchWindowComponent', () => {
  let component: SearchWindowComponent;
  let fixture: ComponentFixture<SearchWindowComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const filterGroups: SearchFilterGroup[] = [
    {
      label: 'group-1',
      useDynamicActiveMapItemsFilter: false,
      filters: [
        {
          label: 'Yes',
          isActive: false,
          type: 'places',
        },
        {
          label: 'No',
          isActive: false,
          type: 'places',
        },
        {
          label: 'Maybe',
          isActive: false,
          type: 'places',
        },
      ],
    },
    {
      label: 'group-2',
      useDynamicActiveMapItemsFilter: true,
      filters: [
        {
          label: 'I dont know',
          isActive: false,
          type: 'places',
        },
        {
          label: 'Can you repeat the question',
          isActive: false,
          type: 'places',
        },
      ],
    },
  ];

  const configServiceMock: Partial<ConfigService> = {
    searchConfig: {
      mapPage: {
        filterGroups,
      },
    } as ConfigService['searchConfig'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchWindowComponent],
      providers: [{provide: ConfigService, useValue: configServiceMock}, provideMockStore(), provideUiTour()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectMaps, []);
    store.overrideSelector(selectActiveMapItemState, {
      items: [],
    });
    store.overrideSelector(selectTerm, 'hello world');
    store.overrideSelector(selectFilteredSearchApiResultMatches, []);
    store.overrideSelector(selectFilterGroups, filterGroups);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(SearchWindowComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the search bar', () => {
    expect(compiled.querySelector('search-bar')).toBeTruthy();
  });

  it('should render the result groups', () => {
    expect(compiled.querySelector('result-groups')).toBeTruthy();
  });

  it('should render the search window container', () => {
    expect(compiled.querySelector('.search-window')).toBeTruthy();
    expect(compiled.querySelector('.search-window__results-container')).toBeTruthy();
  });

  it('should configure the search bar with compact mode', () => {
    const searchBar = fixture.debugElement.query(By.directive(SearchBarComponent));

    expect(searchBar.componentInstance.mode()).toBe('compact');
  });

  it('should configure the search bar with the map page search config', () => {
    const searchBar = fixture.debugElement.query(By.directive(SearchBarComponent));

    expect(searchBar.componentInstance.searchConfig()).toBe(component.searchConfig);
  });

  it('should configure the search bar with the expected placeholder', () => {
    const searchBar = fixture.debugElement.query(By.directive(SearchBarComponent));

    expect(searchBar.componentInstance.placeholderText()).toBe('Suchen nach Adressen, Orten, Karten und mehr...');
  });

  it('should expose the regular screen mode', () => {
    expect(component.screenMode()).toBe('regular');
  });

  it('should update the screen mode from the store', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(component.screenMode()).toBe('mobile');
  });

  it('should expose the selected search result from the store', () => {
    expect(component.selectedSearchResult()).toBeUndefined();
  });

  it('should dispatch the configured filter groups when the component is created', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.setFilterGroups({filterGroups}));
  });

  it('should dispatch the filter groups only once during component creation', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.setFilterGroups({filterGroups}));
  });

  it('should update the search input when a search result is selected', async () => {
    const setTermSpy = vi.spyOn(component.searchComponent().searchInput(), 'setTerm');

    const selectedSearchResult: GeometryWithSrsSearchApiResultMatch = {
      displayString: 'Selected result',
      indexType: 'places',
      geometry: {
        type: 'Point',
        coordinates: [1, 1],
        srs: 2056,
      },
      score: 0,
    };

    store.overrideSelector(selectSelectedSearchResult, selectedSearchResult);
    store.refreshState();
    fixture.detectChanges();

    await Promise.resolve();

    expect(setTermSpy).toHaveBeenCalledWith('Selected result', false);
  });

  it('should not update the search input when no search result is selected', async () => {
    const setTermSpy = vi.spyOn(component.searchComponent().searchInput(), 'setTerm');

    fixture.detectChanges();

    await Promise.resolve();

    expect(setTermSpy).not.toHaveBeenCalled();
  });

  it('should update the search input when the selected search result changes', async () => {
    const setTermSpy = vi.spyOn(component.searchComponent().searchInput(), 'setTerm');

    const firstSearchResult: GeometryWithSrsSearchApiResultMatch = {
      displayString: 'First result',
      indexType: 'places',
      geometry: {
        type: 'Point',
        coordinates: [1, 1],
        srs: 2056,
      },
      score: 0,
    };

    const secondSearchResult: GeometryWithSrsSearchApiResultMatch = {
      displayString: 'Second result',
      indexType: 'places',
      geometry: {
        type: 'Point',
        coordinates: [1, 1],
        srs: 2056,
      },
      score: 0,
    };

    store.overrideSelector(selectSelectedSearchResult, firstSearchResult);
    store.refreshState();
    fixture.detectChanges();

    await Promise.resolve();

    store.overrideSelector(selectSelectedSearchResult, secondSearchResult);
    store.refreshState();
    fixture.detectChanges();

    await Promise.resolve();

    expect(setTermSpy).toHaveBeenNthCalledWith(1, 'First result', false);
    expect(setTermSpy).toHaveBeenNthCalledWith(2, 'Second result', false);
  });

  it('should expose the result group component through its view child', () => {
    const resultGroups = fixture.debugElement.query(By.directive(ResultGroupsComponent));

    expect(resultGroups).toBeTruthy();
    expect(component.resultGroupsComponent()).toBe(resultGroups.componentInstance);
  });

  it('should expose an empty list of search results initially', () => {
    expect(component.allSearchResults()).toEqual([]);
  });
});
