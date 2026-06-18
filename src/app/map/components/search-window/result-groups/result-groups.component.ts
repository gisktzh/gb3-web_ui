import {Component, Input, QueryList, ViewChildren, inject} from '@angular/core';
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
import {NgClass} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {selectTerms} from 'src/app/state/app/selectors/search-terms.selector';

@Component({
  selector: 'result-groups',
  templateUrl: './result-groups.component.html',
  styleUrls: ['./result-groups.component.scss'],
  imports: [LoadingAndProcessBarComponent, MatAccordion, NgClass, ResultGroupComponent],
})
export class ResultGroupsComponent {
  private readonly store = inject(Store);

  @ViewChildren(ResultGroupComponent) public readonly resultGroupComponents!: QueryList<ResultGroupComponent>;
  @Input() public showMultiplePanels: boolean = true;
  public searchTerms = toSignal(this.store.select(selectTerms), {initialValue: []});
  public filteredAddressesAndPlacesMatches = toSignal(this.store.select(selectFilteredAddressesAndPlacesMatches), {initialValue: []});
  public filteredActiveMapMatches = toSignal(this.store.select(selectFilteredActiveMapMatches), {initialValue: []});
  public filteredMaps = toSignal(this.store.select(selectFilteredLayerCatalogMaps), {initialValue: []});
  public searchApiLoadingState = toSignal(this.store.select(selectSearchApiLoadingState));
  public screenMode = toSignal(this.store.select(selectScreenMode), {initialValue: 'regular'});
  public selectedSearchResult = toSignal(this.store.select(selectSelectedSearchResult));
}
