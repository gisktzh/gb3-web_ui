import {AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
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
import {SearchResultIdentifierDirective} from '../../../../shared/directives/search-result-identifier.directive';

@Component({
  selector: 'result-groups',
  templateUrl: './result-groups.component.html',
  styleUrls: ['./result-groups.component.scss'],
  standalone: false,
})
export class ResultGroupsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren(ResultGroupComponent) private readonly resultGroupComponents!: QueryList<ResultGroupComponent>;
  @Input() showMultiplePanels: boolean = true;
  public searchTerms: string[] = [];
  public filteredAddressesAndPlacesMatches: GeometrySearchApiResultMatch[] = [];
  public filteredActiveMapMatches: GeometrySearchApiResultMatch[] = [];
  public filteredMaps: Map[] = [];
  public searchApiLoadingState: LoadingState;
  public screenMode: ScreenMode = 'regular';
  public selectedSearchResult?: GeometrySearchApiResultMatch;

  private unlistenArrowDown: () => void;
  private unlistenArrowUp: () => void;
  private allSearchResults: SearchResultIdentifierDirective[] = [];
  private selectedSearchResultIndex: number = -1;

  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);
  private readonly filteredSearchApiResultMatches$ = this.store.select(selectFilteredSearchApiResultMatches);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly renderer: Renderer2,
  ) {
    this.unlistenArrowDown = this.renderer.listen('document', 'keydown.arrowdown', () => {
      if (
        this.searchTerms[0].length >= 1 &&
        (this.filteredMaps.length !== 0 ||
          this.filteredActiveMapMatches.length !== 0 ||
          this.filteredAddressesAndPlacesMatches.length !== 0) &&
        !this.selectedSearchResult
      ) {
        // Remove style from current selected search result
        this.removeStyleFromCurrentSelectedSearchResult();
        this.updateIndex('down');
        this.addStyleToNewSelectedSearchResult();
      }
    });

    this.unlistenArrowUp = this.renderer.listen('document', 'keydown.arrowup', () => {
      if (
        this.searchTerms[0].length >= 1 &&
        (this.filteredMaps.length !== 0 ||
          this.filteredActiveMapMatches.length !== 0 ||
          this.filteredAddressesAndPlacesMatches.length !== 0) &&
        !this.selectedSearchResult
      ) {
        this.removeStyleFromCurrentSelectedSearchResult();
        this.updateIndex('up');
        this.addStyleToNewSelectedSearchResult();
      }
    });
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.unlistenArrowDown();
    this.unlistenArrowUp();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.resultGroupComponents.changes.subscribe((resultGroupComponents: ResultGroupComponent[]) => {
        this.allSearchResults = [];
        this.resultGroupComponents.forEach((resultGroupComponent) => {
          this.allSearchResults = this.allSearchResults.concat(resultGroupComponent.searchResultElement.toArray());
        });
      }),
    );
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.searchTerm$
        .pipe(
          tap((searchTerm) => {
            this.searchTerms = searchTerm.split(' ');
            this.selectedSearchResultIndex = -1;
          }),
        )
        .subscribe(),
    );
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

  private removeStyleFromCurrentSelectedSearchResult() {
    if (this.selectedSearchResultIndex >= 0) {
      const selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
      this.renderer.removeStyle(selectedResult.host.nativeElement, 'backgroundColor');
      selectedResult.removeSearchResult();
    }
  }

  private updateIndex(direction: 'up' | 'down') {
    switch (direction) {
      case 'up':
        if (this.selectedSearchResultIndex <= 0) {
          this.selectedSearchResultIndex = this.allSearchResults.length - 1;
        } else {
          this.selectedSearchResultIndex--;
        }
        break;
      case 'down':
        if (this.selectedSearchResultIndex >= this.allSearchResults.length - 1) {
          this.selectedSearchResultIndex = 0;
        } else {
          this.selectedSearchResultIndex++;
        }
        break;
    }
  }

  private addStyleToNewSelectedSearchResult() {
    const selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
    this.renderer.setStyle(selectedResult.host.nativeElement, 'backgroundColor', 'red');
    selectedResult.host.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
    selectedResult.dispatchEventIfMapResult();
  }
}
