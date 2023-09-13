import {Component, OnDestroy, OnInit} from '@angular/core';
import {selectSearchApiLoadingState, selectTerm} from '../../../../state/app/reducers/search.reducer';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {
  selectFilteredLayerCatalogMaps,
  selectFilteredSearchApiResultMatches,
} from '../../../../state/app/selectors/search-results.selector';
import {GeometrySearchApiResultMatch} from '../../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';

@Component({
  selector: 'result-groups',
  templateUrl: './result-groups.component.html',
  styleUrls: ['./result-groups.component.scss'],
})
export class ResultGroupsComponent implements OnInit, OnDestroy {
  public searchTerms: string[] = [];
  public filteredAddressesAndPlacesMatches: GeometrySearchApiResultMatch[] = [];
  public filteredActiveMapMatches: GeometrySearchApiResultMatch[] = [];
  public filteredMaps: Map[] = [];
  public searchApiLoadingState: LoadingState = 'undefined';

  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly filteredSearchApiResultMatches$ = this.store.select(selectFilteredSearchApiResultMatches);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.searchTerm$.pipe(tap((searchTerm) => (this.searchTerms = searchTerm.split(' ')))).subscribe());
    this.subscriptions.add(this.filteredMaps$.pipe(tap((filteredMaps) => (this.filteredMaps = filteredMaps))).subscribe());
    this.subscriptions.add(
      this.filteredSearchApiResultMatches$
        .pipe(
          tap((filteredSearchApiResultMatches) => {
            const filteredAddressesAndPlacesMatches: GeometrySearchApiResultMatch[] = [];
            const filteredActiveMapMatches: GeometrySearchApiResultMatch[] = [];
            filteredSearchApiResultMatches.forEach((resultMatch) => {
              if (resultMatch.indexType) {
                switch (resultMatch.indexType) {
                  case 'addresses':
                  case 'places':
                    filteredAddressesAndPlacesMatches.push(resultMatch);
                    break;
                  case 'activeMapItems':
                    filteredActiveMapMatches.push(resultMatch);
                    break;
                  case 'metadata-maps':
                  case 'metadata-products':
                  case 'metadata-datasets':
                  case 'metadata-services':
                    // ignore
                    break;
                }
              }
            });
            this.filteredAddressesAndPlacesMatches = filteredAddressesAndPlacesMatches;
            this.filteredActiveMapMatches = filteredActiveMapMatches;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(
      this.searchApiLoadingState$.pipe(tap((searchApiLoadingState) => (this.searchApiLoadingState = searchApiLoadingState))).subscribe(),
    );
  }
}
