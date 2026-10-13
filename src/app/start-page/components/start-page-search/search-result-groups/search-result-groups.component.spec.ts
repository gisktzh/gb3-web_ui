import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectSearchApiLoadingState} from '../../../../state/app/reducers/search.reducer';
import {selectLoadingState as selectDataCatalogLoadingState} from '../../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../../../state/map/reducers/layer-catalog.reducer';
import {selectScreenMode} from '../../../../state/app/reducers/app-layout.reducer';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
  selectFilteredUsefulLinks,
} from '../../../../state/app/selectors/search-results.selector';
import {SearchResultGroupsComponent} from './search-result-groups.component';

describe('SearchResultGroupsComponent', () => {
  let store: MockStore;
  let fixture: ComponentFixture<SearchResultGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [SearchResultGroupsComponent], providers: [provideMockStore()]}).compileComponents();
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectLayerCatalogLoadingState, 'loaded');
    store.overrideSelector(selectDataCatalogLoadingState, 'loaded');
    store.overrideSelector(selectSearchApiLoadingState, 'loaded');
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectFilteredLayerCatalogMaps, []);
    store.overrideSelector(selectFilteredMetadataItems, []);
    store.overrideSelector(selectFilteredFaqItems, []);
    store.overrideSelector(selectFilteredUsefulLinks, []);
    store.refreshState();
    fixture = TestBed.createComponent(SearchResultGroupsComponent);
    fixture.detectChanges();
  });

  it('combines catalogue and search loading states conservatively', () => {
    expect(fixture.componentInstance.combinedSearchAndDataCatalogLoadingState()).toBe('loaded');
    store.overrideSelector(selectSearchApiLoadingState, 'loading');
    store.refreshState();
    expect(fixture.componentInstance.combinedSearchAndDataCatalogLoadingState()).toBe('loading');
    store.overrideSelector(selectDataCatalogLoadingState, 'error');
    store.refreshState();
    expect(fixture.componentInstance.combinedSearchAndDataCatalogLoadingState()).toBe('error');
  });

  it('does not render result groups without results or pending loads', () => {
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('search-result-group')).toHaveLength(0);
  });
});
