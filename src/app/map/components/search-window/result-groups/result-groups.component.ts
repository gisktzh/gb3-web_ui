import {Component, Input, OnDestroy, OnInit, QueryList, ViewChildren, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {GeometrySearchApiResultMatch} from '../../../../shared/services/apis/search/interfaces/search-api-result-match.interface';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {selectSearchApiLoadingState, selectSelectedSearchResult, selectTerm} from '../../../../state/app/reducers/search.reducer';
import {
  selectFilteredLayerCatalogMaps,
  selectFilteredSearchApiResultMatches,
} from '../../../../state/app/selectors/search-results.selector';
import {ResultGroupComponent} from './result-group/result-group.component';

@Component({
  selector: 'result-groups',
  templateUrl: './result-groups.component.html',
  styleUrls: ['./result-groups.component.scss'],
  standalone: false,
})
export class ResultGroupsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @ViewChildren(ResultGroupComponent) public readonly resultGroupComponents!: QueryList<ResultGroupComponent>;
  @Input() public showMultiplePanels: boolean = true;
  public searchTerms: string[] = [];
  public filteredAddressesAndPlacesMatches: GeometrySearchApiResultMatch[] = [];
  public filteredActiveMapMatches: GeometrySearchApiResultMatch[] = [];
  public filteredMaps: Map[] = [];
  public searchApiLoadingState: LoadingState;
  public screenMode: ScreenMode = 'regular';
  public selectedSearchResult?: GeometrySearchApiResultMatch;

  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);
  private readonly filteredSearchApiResultMatches$ = this.store.select(selectFilteredSearchApiResultMatches);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

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
                  case 'gvz':
                  case 'egid':
                  case 'egrid':
                  case 'parcels':
                    filteredAddressesAndPlacesMatches.push(resultMatch);
                    break;
                  case 'activeMapItems':
                    filteredActiveMapMatches.push(resultMatch);
                    break;
                  case 'metadata-maps':
                  case 'metadata-products':
                  case 'metadata-datasets':
                  case 'metadata-services':
                  case 'unknown':
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
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(
      this.selectedSearchResult$.pipe(tap((selectedSearchResult) => (this.selectedSearchResult = selectedSearchResult))).subscribe(),
    );
  }
}
