import {Component, input, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectSearchState} from '../../../../state/app/reducers/search.reducer';
import {selectScreenMode} from '../../../../state/app/reducers/app-layout.reducer';
import {selectIsAnySearchFilterActiveSelector} from '../../../../state/app/selectors/is-any-search-filter-active.selector';
import {ConfigService} from '../../../services/config.service';
import {MatDialog} from '@angular/material/dialog';
import {SearchBarComponent} from './search-bar.component';
import {inputBinding, signal} from '@angular/core';
import {SearchActions} from '../../../../state/app/actions/search.actions';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {PanelClass} from '../../../enums/panel-class.enum';
import {SearchMode} from '../../../types/search-mode.type';

@Component({
  selector: 'search-input',
  standalone: true,
  template: `
    <button class="change-search" (click)="changeSearchTermEvent.emit('test-term')">Change</button>
    <button class="clear-search" (click)="clearSearchTermEvent.emit()">Clear</button>
    <button class="open-filter" (click)="openFilterEvent.emit()">Filter</button>
    <button class="focus" (click)="focusEvent.emit()">Focus</button>
  `,
})
class MockSearchInputComponent {
  public readonly placeholderText = input('');
  public readonly mode = input<SearchMode>('normal');
  public readonly showFilterButton = input(true);
  public readonly isAnyFilterActive = input(false);

  public readonly changeSearchTermEvent = output<string>();
  public readonly clearSearchTermEvent = output<void>();
  public readonly openFilterEvent = output<void>();
  public readonly focusEvent = output<void>();
}

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const configServiceMock: Partial<ConfigService> = {
    searchConfig: {
      mapPage: {
        searchOptions: {
          searchIndexTypes: [],
          maps: false,
          faq: false,
        },
        filterGroups: [],
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

  const dialogServiceMock: Partial<MatDialog> = {
    open: vi.fn(),
  };

  const mode = signal<SearchMode>('normal');
  const placeholderText = signal('Search placeholder');
  const searchConfig = signal({
    searchOptions: {
      searchIndexTypes: [],
      maps: false,
      faq: false,
    },
    filterGroups: [],
  });
  const showFilterButton = signal(true);
  const hasFocusEvent = signal(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent, MockSearchInputComponent],
      providers: [
        {provide: ConfigService, useValue: configServiceMock},
        {provide: MatDialog, useValue: dialogServiceMock},
        provideMockStore(),
      ],
    })
      .overrideComponent(SearchBarComponent, {
        set: {
          imports: [MockSearchInputComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectSearchState, {
      term: '',
      searchApiLoadingState: undefined,
      searchApiResultMatches: [],
      filterGroups: [],
      selectedSearchResult: undefined,
    });
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectIsAnySearchFilterActiveSelector, false);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(SearchBarComponent, {
      bindings: [
        inputBinding('mode', mode),
        inputBinding('placeholderText', placeholderText),
        inputBinding('searchConfig', searchConfig),
        inputBinding('showFilterButton', showFilterButton),
        inputBinding('hasFocusEvent', hasFocusEvent),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch filter groups on creation', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      SearchActions.setFilterGroups({
        filterGroups: [],
      }),
    );
  });

  it('should render input values', () => {
    const searchInput = fixture.debugElement.query(By.directive(MockSearchInputComponent)).componentInstance as MockSearchInputComponent;

    expect(searchInput.placeholderText()).toBe('Search placeholder');
    expect(searchInput.mode()).toBe('normal');
    expect(searchInput.showFilterButton()).toBe(true);
  });

  it('should render regular class when screen mode is regular', () => {
    expect(compiled.querySelector('.search-window__searchbar--mobile')).toBeFalsy();
  });

  it('should render mobile class when screen mode is mobile', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('.search-window__searchbar--mobile')).toBeTruthy();
  });

  it('should dispatch search action when child emits search term', () => {
    const child = fixture.debugElement.query(By.directive(MockSearchInputComponent)).componentInstance as MockSearchInputComponent;

    child.changeSearchTermEvent.emit('hello');
    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      SearchActions.searchForTerm({
        term: 'hello',
        options: {
          searchIndexTypes: [],
          maps: false,
          faq: false,
        },
      }),
    );
  });

  it('should dispatch clear action when child emits clear event', () => {
    const button = compiled.querySelector('.clear-search') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(SearchActions.clearSearchTerm());
  });

  it('should open filter dialog when child emits filter event', () => {
    const button = compiled.querySelector('.open-filter') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();

    expect(dialogServiceMock.open).toHaveBeenCalledWith(expect.anything(), {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  });

  it('should dispatch bottom sheet action on mobile focus', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    hasFocusEvent.set(true);
    fixture.detectChanges();

    const button = compiled.querySelector('.focus') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapUiActions.showBottomSheet({
        bottomSheetContent: 'search',
      }),
    );
  });

  it('should not dispatch bottom sheet action when focus event is disabled', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();

    hasFocusEvent.set(false);
    fixture.detectChanges();

    storeDispatchSpy.mockClear();

    const button = compiled.querySelector('.focus') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(storeDispatchSpy).not.toHaveBeenCalledWith(
      MapUiActions.showBottomSheet({
        bottomSheetContent: 'search',
      }),
    );
  });
});
