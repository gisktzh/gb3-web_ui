import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, input, inputBinding, signal} from '@angular/core';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {By} from '@angular/platform-browser';
import {Mock} from 'vitest';
import {MatDialog} from '@angular/material/dialog';
import {ConfigService} from 'src/app/shared/services/config.service';
import {SearchActions} from 'src/app/state/app/actions/search.actions';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';
import {selectSelectedSearchResult, selectTerm} from '../../../state/app/reducers/search.reducer';
import {SearchInputComponent} from '../../../shared/components/search/search-input.component';
import {ResultGroupsComponent} from '../search-window/result-groups/result-groups.component';
import {SearchWindowMobileComponent} from './search-window-mobile.component';
import {GeometryWithSrsSearchApiResultMatch} from 'src/app/shared/services/apis/search/interfaces/search-api-result-match.interface';
import {provideUiTour} from 'ngx-ui-tour-md-menu';

@Component({
  selector: 'result-groups',
  standalone: true,
  template: '',
})
class MockResultGroupsComponent {
  public readonly showMultiplePanels = input(false);
}

describe('SearchWindowMobileComponent', () => {
  let component: SearchWindowMobileComponent;
  let fixture: ComponentFixture<SearchWindowMobileComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const dialogServiceMock: Partial<MatDialog> = {
    open: vi.fn(),
  };

  const configServiceMock: Partial<ConfigService> = {
    searchConfig: {
      mapPage: {
        filterGroups: [],
        searchOptions: {
          searchIndexTypes: [],
          maps: false,
          faq: false,
        },
      },
      startPage: {
        searchOptions: {
          searchIndexTypes: [],
          maps: false,
          faq: false,
        },
        filterGroups: [],
      },
      dataCatalogPage: {
        searchOptions: {
          searchIndexTypes: [],
          maps: false,
          faq: false,
        },
        filterGroups: [],
      },
    },
  };

  const focusOnInit = signal(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchWindowMobileComponent],
      providers: [
        {provide: MatDialog, useValue: dialogServiceMock},
        {provide: ConfigService, useValue: configServiceMock},
        provideMockStore(),
        provideUiTour(),
      ],
    })
      .overrideComponent(SearchWindowMobileComponent, {
        remove: {
          imports: [ResultGroupsComponent],
        },
        add: {
          imports: [MockResultGroupsComponent],
          providers: [{provide: MatDialog, useValue: dialogServiceMock}],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsAnySearchFilterActiveSelector, false);
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.overrideSelector(selectTerm, '');
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(SearchWindowMobileComponent, {
      bindings: [inputBinding('focusOnInit', focusOnInit)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the search window and results container', () => {
    expect(compiled.querySelector('.search-window-mobile')).toBeTruthy();
    expect(compiled.querySelector('.search-window-mobile__searchbar')).toBeTruthy();
    expect(compiled.querySelector('.search-window-mobile__results-container')).toBeTruthy();
    expect(compiled.querySelector('result-groups')).toBeTruthy();
  });

  it('should render the search input with mobile mode and fixed placeholder', () => {
    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));

    expect(searchInput).toBeTruthy();
    expect(searchInput.componentInstance.mode()).toBe('mobile');
    expect(searchInput.componentInstance.placeholderText()).toBe('Suchen nach Adressen, Orten, Karten und mehr...');
  });

  it('should pass focusOnInit to the search input', () => {
    focusOnInit.set(false);
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));

    expect(searchInput.componentInstance.focusOnInit()).toBe(false);
  });

  it('should pass the active filter state to the search input', () => {
    store.overrideSelector(selectIsAnySearchFilterActiveSelector, true);
    store.refreshState();
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));

    expect(searchInput.componentInstance.isAnyFilterActive()).toBe(true);
  });

  it('should dispatch setFilterGroups on creation', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      SearchActions.setFilterGroups({
        filterGroups: configServiceMock.searchConfig!.mapPage.filterGroups,
      }),
    );
  });

  it('should dispatch searchForTerm when the search input emits a term', () => {
    const term = 'Zurich';

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));

    searchInput.componentInstance.changeSearchTermEvent.emit(term);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      SearchActions.searchForTerm({
        term,
        options: configServiceMock.searchConfig!.mapPage.searchOptions,
      }),
    );
  });

  it('should dispatch clearSearchTerm when the search input emits the clear event', () => {
    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));

    searchInput.componentInstance.clearSearchTermEvent.emit();

    expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.clearSearchTerm());
  });

  it('should open the filter dialog when the search input emits the open filter event', async () => {
    vi.useFakeTimers();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));

    searchInput.componentInstance.openFilterEvent.emit();

    await vi.runAllTimersAsync();

    expect(dialogServiceMock.open).toHaveBeenCalledWith(expect.anything(), {
      panelClass: expect.anything(),
      restoreFocus: false,
    });
  });

  it('should update the search input from the selected search result', async () => {
    vi.useFakeTimers();

    const selectedSearchResult: GeometryWithSrsSearchApiResultMatch = {
      displayString: 'Selected result',
      indexType: 'addresses',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
        srs: 2056,
      },
      score: 0,
    };

    store.overrideSelector(selectSelectedSearchResult, selectedSearchResult);
    store.refreshState();
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));
    const setTermSpy = vi.spyOn(searchInput.componentInstance, 'setTerm');

    await vi.runAllTimersAsync();

    expect(setTermSpy).toHaveBeenCalledWith('Selected result', false);
  });

  it('should use an empty string when the selected search result has no display string', async () => {
    vi.useFakeTimers();

    const selectedSearchResult: GeometryWithSrsSearchApiResultMatch = {
      displayString: '',
      indexType: 'addresses',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
        srs: 2056,
      },
      score: 0,
    };

    store.overrideSelector(selectSelectedSearchResult, selectedSearchResult);
    store.refreshState();
    fixture.detectChanges();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));
    const setTermSpy = vi.spyOn(searchInput.componentInstance, 'setTerm');

    await vi.runAllTimersAsync();

    expect(setTermSpy).toHaveBeenCalledWith('', false);
  });

  it('should update the search input from the search term when no result is selected', async () => {
    vi.useFakeTimers();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));
    const setTermSpy = vi.spyOn(searchInput.componentInstance, 'setTerm');

    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.overrideSelector(selectTerm, 'current search term');
    store.refreshState();
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(setTermSpy).toHaveBeenCalledWith('current search term', false);
  });

  it('should use an empty string when there is no selected result and no search term', async () => {
    vi.useFakeTimers();

    const searchInput = fixture.debugElement.query(By.directive(SearchInputComponent));
    const setTermSpy = vi.spyOn(searchInput.componentInstance, 'setTerm');

    store.overrideSelector(selectTerm, 'asdf');
    store.overrideSelector(selectSelectedSearchResult, undefined);
    store.refreshState();
    fixture.detectChanges();

    store.overrideSelector(selectTerm, '');
    store.refreshState();
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    expect(setTermSpy).toHaveBeenCalledWith('', false);
  });
});
