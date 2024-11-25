import {AfterViewInit, Component, Input, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatestWith, map, Subscription, tap} from 'rxjs';
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

  private listenToEvents: boolean = false;
  private allSearchResults: SearchResultIdentifierDirective[] = [];
  private resultGroups: {isVisible: boolean; size: number}[] = [];
  private selectedSearchResultIndex: number = -1;
  private readonly unlistenArrowDown: () => void;
  private readonly unlistenArrowUp: () => void;
  private readonly unlistenEnter: () => void;

  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);
  private readonly filteredSearchApiResultMatches$ = this.store.select(selectFilteredSearchApiResultMatches);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly searchApiLoadingState$ = this.store.select(selectSearchApiLoadingState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly listenToEvents$ = this.searchTerm$.pipe(
    combineLatestWith(this.selectedSearchResult$, this.filteredMaps$, this.filteredSearchApiResultMatches$),
    map(([searchTerm, selectedSearchResult, filteredMaps, filteredSearchApiResultMatches]) => {
      return (
        searchTerm.split(' ')[0].length >= 1 &&
        (filteredMaps.length !== 0 || filteredSearchApiResultMatches.length !== 0) &&
        !selectedSearchResult
      );
    }),
  );
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly renderer: Renderer2,
  ) {
    this.unlistenArrowDown = this.renderer.listen('document', 'keydown.arrowdown', (event) => {
      event.preventDefault();
      if (this.listenToEvents) {
        this.removeStyleFromCurrentSelectedSearchResult();
        this.updateIndex('down');
        this.addStyleToNewSelectedSearchResult();
      }
    });

    this.unlistenArrowUp = this.renderer.listen('document', 'keydown.arrowup', (event) => {
      event.preventDefault();
      if (this.listenToEvents) {
        this.removeStyleFromCurrentSelectedSearchResult();
        this.updateIndex('up');
        this.addStyleToNewSelectedSearchResult();
      }
    });

    this.unlistenEnter = this.renderer.listen('document', 'keydown.enter', () => {
      if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
        this.allSearchResults[this.selectedSearchResultIndex].host.nativeElement.click();
      }
    });
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.unlistenArrowDown();
    this.unlistenArrowUp();
    this.unlistenEnter();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.resultGroupComponents.changes.subscribe((resultGroupComponents: ResultGroupComponent[]) => {
        this.allSearchResults = [];
        this.resultGroups = [];
        resultGroupComponents.forEach((resultGroupComponent) => {
          this.resultGroups.push({isVisible: resultGroupComponent.isExpanded, size: resultGroupComponent.searchResults.length});
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
            this.removeStyleFromCurrentSelectedSearchResult();
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
    this.subscriptions.add(this.listenToEvents$.pipe(tap((listenToEvents) => (this.listenToEvents = listenToEvents))).subscribe());
  }

  private removeStyleFromCurrentSelectedSearchResult() {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      const selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
      this.renderer.removeStyle(selectedResult.host.nativeElement, 'outline');
      selectedResult.removeSearchResult();
    }
  }

  private updateIndex(direction: 'up' | 'down') {
    switch (direction) {
      case 'up':
        if (this.selectedSearchResultIndex < 0) {
          this.selectedSearchResultIndex = this.allSearchResults.length - 1;
        } else {
          this.selectedSearchResultIndex--;
        }
        break;
      case 'down':
        if (this.selectedSearchResultIndex >= this.allSearchResults.length - 1) {
          this.selectedSearchResultIndex = -1;
        } else {
          this.selectedSearchResultIndex++;
        }
        break;
    }
  }

  private addStyleToNewSelectedSearchResult() {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      const selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
      this.renderer.setStyle(selectedResult.host.nativeElement, 'outline', 'rgb(16, 16, 16) auto 1px');
      selectedResult.host.nativeElement.scrollIntoView({behavior: 'smooth', block: 'center'});
      selectedResult.dispatchEventIfMapResult();
    }
  }
}
