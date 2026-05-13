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
  public readonly showMultiplePanels = input(true);
  public readonly searchTerms = this.store.selectSignal(selectTerms);
  public readonly filteredAddressesAndPlacesMatches = this.store.selectSignal(selectFilteredAddressesAndPlacesMatches);
  public readonly filteredActiveMapMatches = this.store.selectSignal(selectFilteredActiveMapMatches);
  public readonly filteredMaps = this.store.selectSignal(selectFilteredLayerCatalogMaps);
  public readonly searchApiLoadingState = this.store.selectSignal(selectSearchApiLoadingState);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly selectedSearchResult = this.store.selectSignal(selectSelectedSearchResult);
}
