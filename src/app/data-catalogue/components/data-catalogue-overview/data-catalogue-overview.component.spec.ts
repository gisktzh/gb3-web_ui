import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchOptions} from '../../../shared/interfaces/search-config.interface';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {selectLoadingState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {selectActiveFilterValues} from '../../../state/data-catalogue/selectors/active-filter-values.selector';
import {selectDataCatalogueItems} from '../../../state/data-catalogue/selectors/data-catalogue-items.selector';
import {DataCatalogueFilterDialogComponent} from '../data-catalogue-filter-dialog/data-catalogue-filter-dialog.component';
import {DataCatalogueOverviewComponent} from './data-catalogue-overview.component';

describe('DataCatalogueOverviewComponent', () => {
  let fixture: ComponentFixture<DataCatalogueOverviewComponent>;
  let component: DataCatalogueOverviewComponent;
  let element: HTMLElement;
  let store: MockStore;
  const open = vi.fn();
  const searchOptions: SearchOptions = {
    faq: false,
    maps: false,
    searchIndexTypes: ['metadata-maps', 'metadata-datasets', 'metadata-services', 'metadata-products'],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCatalogueOverviewComponent],
      providers: [
        provideMockStore({
          selectors: [
            {selector: selectLoadingState, value: 'loading'},
            {selector: selectActiveFilterValues, value: []},
            {selector: selectDataCatalogueItems, value: []},
            {selector: selectScreenMode, value: 'regular'},
          ],
        }),
        {provide: ConfigService, useValue: {searchConfig: {dataCatalogPage: {searchOptions}}}},
        provideUiTour(),
      ],
    });
    await TestBed.compileComponents();

    store = TestBed.inject(MockStore);
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(DataCatalogueOverviewComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    Object.defineProperty(fixture.debugElement.injector.get(MatDialog), 'open', {value: open});
    fixture.detectChanges();

    expect(dispatch).toHaveBeenCalledWith(DataCatalogueActions.loadCatalogue());
    expect(dispatch).toHaveBeenCalledWith(SearchActions.clearSearchTerm());
    dispatch.mockClear();
  });

  it('dispatches search, clear and filter actions', () => {
    const dispatch = vi.spyOn(store, 'dispatch');

    component.searchForTerm('roads');
    component.clearSearchTerm();
    component.toggleFilter({key: 'type', value: 'Dataset'});

    expect(dispatch).toHaveBeenCalledWith(SearchActions.searchForTerm({term: 'roads', options: searchOptions}));
    expect(dispatch).toHaveBeenCalledWith(SearchActions.clearSearchTerm());
    expect(dispatch).toHaveBeenCalledWith(DataCatalogueActions.toggleFilter({key: 'type', value: 'Dataset'}));
  });

  it('opens the filter dialog with its application panel styling', () => {
    component.openFilterWindow();

    expect(open).toHaveBeenCalledWith(DataCatalogueFilterDialogComponent, {
      panelClass: 'api-wrapper-dialog',
      restoreFocus: false,
    });
  });

  it('renders the error state returned by the store', () => {
    store.overrideSelector(selectLoadingState, 'error');
    store.refreshState();
    fixture.detectChanges();

    expect(element.textContent).toContain('Fehler beim Laden der Metadatenübersicht.');
  });

  it('adapts the search presentation to mobile screens and active filters', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.overrideSelector(selectActiveFilterValues, [{key: 'type', value: 'Dataset'}]);
    store.refreshState();
    fixture.detectChanges();

    const search = element.querySelector('search-input');
    expect(element.querySelector('.data-catalogue-overview__search')?.classList.contains('data-catalogue-overview__search--mobile')).toBe(
      true,
    );
    expect(search?.classList.contains('data-catalogue-overview__search__bar--mobile')).toBe(true);
  });
});
