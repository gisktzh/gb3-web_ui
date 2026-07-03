import {Component, computed, inject, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectTerm} from '../../../state/app/reducers/search.reducer';
import {selectActiveSearchFilterValues} from '../../../state/data-catalogue/selectors/active-search-filters.selector';
import {SearchResultGroupsComponent} from './search-result-groups/search-result-groups.component';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
  selectFilteredUsefulLinks,
} from '../../../state/app/selectors/search-results.selector';
import {BaseSearchContainerComponent} from '../../../shared/components/search/base-search-container/base-search-container.component';
import {SearchBarComponent} from '../../../shared/components/search/search-bar/search-bar.component';

import {MatChipRow, MatChipRemove} from '@angular/material/chips';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'start-page-search',
  templateUrl: './start-page-search.component.html',
  styleUrls: ['./start-page-search.component.scss'],
  imports: [SearchBarComponent, MatChipRow, MatChipRemove, MatIcon, SearchResultGroupsComponent],
})
export class StartPageSearchComponent extends BaseSearchContainerComponent {
  protected override store = inject(Store);
  private readonly configService = inject(ConfigService);

  private readonly searchResultGroupsComponent = viewChild(SearchResultGroupsComponent);

  public readonly searchTerm = this.store.selectSignal(selectTerm);
  public readonly searchTerms = computed<string[]>(() => {
    const searchTerm = this.searchTerm()?.trim();
    if (!searchTerm || searchTerm.length === 0) {
      return [];
    }

    return searchTerm.split(/\s+/);
  });
  public readonly activeSearchFilterValues = this.store.selectSignal(selectActiveSearchFilterValues);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly searchConfig = this.configService.searchConfig.startPage;

  public readonly filteredFaqItems = this.store.selectSignal(selectFilteredFaqItems);
  public readonly filteredUsefulLinks = this.store.selectSignal(selectFilteredUsefulLinks);
  public readonly filteredMetadataItems = this.store.selectSignal(selectFilteredMetadataItems);
  public readonly filteredLayerCatalogMaps = this.store.selectSignal(selectFilteredLayerCatalogMaps);

  public readonly combinedSearchData = computed(() => ({
    searchTerms: this.searchTerms(),
    faq: this.filteredFaqItems(),
    usefulLinks: this.filteredUsefulLinks(),
    metadata: this.filteredMetadataItems(),
    layerMaps: this.filteredLayerCatalogMaps(),
  }));

  public override readonly allSearchResults = computed(() => {
    // So it has a dependency on combined search data.
    this.combinedSearchData();

    const resultGroups = this.searchResultGroupsComponent();

    if (!resultGroups) {
      return [];
    }

    return resultGroups.overviewSearchResultItemComponents();
  });

  constructor() {
    super();

    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
  }

  public deactivateFilter(groupLabel: string, filterLabel: string) {
    this.store.dispatch(SearchActions.setFilterValue({groupLabel, filterLabel, isActive: false}));
  }
}
