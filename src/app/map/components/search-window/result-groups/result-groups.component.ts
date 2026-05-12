import {Component, inject, input, viewChildren} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectSearchApiLoadingState, selectSelectedSearchResult} from '../../../../state/app/reducers/search.reducer';
import {
  selectFilteredActiveMapMatches,
  selectFilteredAddressesAndPlacesMatches,
  selectFilteredLayerCatalogMaps,
} from '../../../../state/app/selectors/search-results.selector';
import {ResultGroupComponent} from './result-group/result-group.component';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {MatAccordion} from '@angular/material/expansion';

import {selectTerms} from 'src/app/state/app/selectors/search-terms.selector';

@Component({
  selector: 'result-groups',
  templateUrl: './result-groups.component.html',
  styleUrls: ['./result-groups.component.scss'],
  imports: [LoadingAndProcessBarComponent, MatAccordion, ResultGroupComponent],
})
export class ResultGroupsComponent {
  private readonly store = inject(Store);
  public readonly resultGroupComponents = viewChildren<ResultGroupComponent>(ResultGroupComponent);
  public showMultiplePanels = input(true);
  public searchTerms = this.store.selectSignal(selectTerms);
  public filteredAddressesAndPlacesMatches = this.store.selectSignal(selectFilteredAddressesAndPlacesMatches);
  public filteredActiveMapMatches = this.store.selectSignal(selectFilteredActiveMapMatches);
  public filteredMaps = this.store.selectSignal(selectFilteredLayerCatalogMaps);
  public searchApiLoadingState = this.store.selectSignal(selectSearchApiLoadingState);
  public screenMode = this.store.selectSignal(selectScreenMode);
  public selectedSearchResult = this.store.selectSignal(selectSelectedSearchResult);
}
