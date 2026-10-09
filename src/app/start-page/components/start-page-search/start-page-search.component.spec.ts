import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {searchConfig} from '../../../shared/configs/search.config';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
  selectFilteredUsefulLinks,
} from '../../../state/app/selectors/search-results.selector';
import {selectSearchState, selectTerm, selectSearchApiLoadingState} from '../../../state/app/reducers/search.reducer';
import {selectActiveSearchFilterValues} from '../../../state/data-catalogue/selectors/active-search-filters.selector';
import {selectLoadingState as selectDataCatalogLoadingState} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../../state/map/reducers/layer-catalog.reducer';
import {StartPageSearchComponent} from './start-page-search.component';

describe('StartPageSearchComponent', () => {
  it('normalizes the query and dispatches filter removal', async () => {
    await TestBed.configureTestingModule({
      imports: [StartPageSearchComponent],
      providers: [
        provideMockStore(),
        provideNoopAnimations(),
        provideUiTour(),
        {provide: ConfigService, useValue: {searchConfig}},
        {provide: MatDialog, useValue: {open: vi.fn()}},
      ],
    }).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectTerm, '  flood   maps ');
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectActiveSearchFilterValues, []);
    store.overrideSelector(selectFilteredFaqItems, []);
    store.overrideSelector(selectFilteredLayerCatalogMaps, []);
    store.overrideSelector(selectFilteredMetadataItems, []);
    store.overrideSelector(selectFilteredUsefulLinks, []);
    store.overrideSelector(selectSearchState, {term: '', loadingState: undefined} as never);
    store.overrideSelector(selectIsAnySearchFilterActiveSelector, false);
    store.overrideSelector(selectSearchApiLoadingState, 'loaded');
    store.overrideSelector(selectDataCatalogLoadingState, 'loaded');
    store.overrideSelector(selectLayerCatalogLoadingState, 'loaded');
    store.refreshState();
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(StartPageSearchComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.searchTerms()).toEqual(['flood', 'maps']);
    fixture.componentInstance.deactivateFilter('Category', 'Maps');
    expect(dispatch).toHaveBeenCalledWith(SearchActions.setFilterValue({groupLabel: 'Category', filterLabel: 'Maps', isActive: false}));
    expect((fixture.nativeElement as HTMLElement).querySelector('.start-page-search__results')).not.toBeNull();
  });
});
