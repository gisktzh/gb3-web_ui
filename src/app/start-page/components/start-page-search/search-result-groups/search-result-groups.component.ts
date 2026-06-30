import {Component, computed, inject, viewChildren} from '@angular/core';
import {Store} from '@ngrx/store';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectSearchApiLoadingState} from 'src/app/state/app/reducers/search.reducer';
import {
  selectFilteredFaqItems,
  selectFilteredLayerCatalogMaps,
  selectFilteredMetadataItems,
  selectFilteredUsefulLinks,
} from '../../../../state/app/selectors/search-results.selector';
import {selectLoadingState as selectDataCatalogLoadingState} from '../../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {selectLoadingState as selectLayerCatalogLoadingState} from '../../../../state/map/reducers/layer-catalog.reducer';
import {SearchResultIdentifierDirective} from '../../../../shared/directives/search-result-identifier.directive';
import {MatAccordion} from '@angular/material/expansion';
import {SearchResultGroupComponent} from '../search-result-group/search-result-group.component';
import {SearchResultEntryMapComponent} from '../search-result-entry-map/search-result-entry-map.component';
import {OverviewSearchResultItemComponent} from '../../../../shared/components/data-catalogue-overview-item/overview-search-result-item.component';

@Component({
  selector: 'search-result-groups',
  templateUrl: './search-result-groups.component.html',
  styleUrls: ['./search-result-groups.component.scss'],
  imports: [
    MatAccordion,
    SearchResultGroupComponent,
    SearchResultEntryMapComponent,
    SearchResultIdentifierDirective,
    OverviewSearchResultItemComponent,
  ],
})
export class SearchResultGroupsComponent {
  private readonly store = inject(Store);

  public readonly overviewSearchResultItemComponents = viewChildren<SearchResultIdentifierDirective>(SearchResultIdentifierDirective);

  public readonly layerCatalogLoadingState = this.store.selectSignal(selectLayerCatalogLoadingState);
  public readonly filteredMaps = this.store.selectSignal(selectFilteredLayerCatalogMaps);
  public readonly filteredMetadataItems = this.store.selectSignal(selectFilteredMetadataItems);
  public readonly filteredFaqItems = this.store.selectSignal(selectFilteredFaqItems);
  public readonly filteredUsefulLinks = this.store.selectSignal(selectFilteredUsefulLinks);
  public readonly dataCatalogLoadingState = this.store.selectSignal(selectDataCatalogLoadingState);
  public readonly searchApiLoadingState = this.store.selectSignal(selectSearchApiLoadingState);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  public readonly combinedSearchAndDataCatalogLoadingState = computed<LoadingState>(() => {
    if (this.dataCatalogLoadingState() === 'error' || this.searchApiLoadingState() === 'error') {
      return 'error';
    }

    if (this.dataCatalogLoadingState() === 'loaded' && this.searchApiLoadingState() === 'loaded') {
      return 'loaded';
    }

    if (this.dataCatalogLoadingState() === 'loading' || this.searchApiLoadingState() === 'loading') {
      return 'loading';
    }

    return undefined;
  });
}
