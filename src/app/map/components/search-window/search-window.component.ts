import {AfterViewInit, Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {combineLatestWith, filter, map, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {SearchFilterDialogComponent} from '../../../shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {initialState, selectSearchState, selectSelectedSearchResult, selectTerm} from '../../../state/app/reducers/search.reducer';
import {SearchState} from '../../../state/app/states/search.state';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';
import {SearchComponent} from '../../../shared/components/search/search.component';
import {ResultGroupsComponent} from './result-groups/result-groups.component';
import {SearchResultIdentifierDirective} from '../../../shared/directives/search-result-identifier.directive';
import {selectFilteredLayerCatalogMaps, selectFilteredSearchApiResultMatches} from '../../../state/app/selectors/search-results.selector';
import {ResultGroupComponent} from './result-groups/result-group/result-group.component';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss'],
  standalone: false,
})
export class SearchWindowComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchState: SearchState = initialState;
  public screenMode: ScreenMode = 'regular';
  public isAnySearchFilterActive: boolean = false;
  public term: string = '';

  @ViewChild(SearchComponent) private readonly searchComponent!: SearchComponent;

  @ViewChild(ResultGroupsComponent) private readonly resultGroupsComponent!: ResultGroupsComponent;
  private listenToEvents: boolean = false;
  private allSearchResults: SearchResultIdentifierDirective[] = [];
  private selectedSearchResultIndex: number = -1;
  private selectedResult: SearchResultIdentifierDirective | undefined;

  private readonly searchConfig = this.configService.searchConfig.mapPage;
  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly isAnySearchFilterActive$ = this.store.select(selectIsAnySearchFilterActiveSelector);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);
  private readonly term$ = this.store.select(selectTerm).pipe(
    tap((term: string) => {
      this.selectedSearchResultIndex = -1;
      this.term = term;
    }),
  );
  private readonly subscriptions: Subscription = new Subscription();

  private readonly filteredSearchApiResultMatches$ = this.store.select(selectFilteredSearchApiResultMatches);
  private readonly filteredMaps$ = this.store.select(selectFilteredLayerCatalogMaps);
  private readonly listenToEvents$ = this.term$.pipe(
    combineLatestWith(this.selectedSearchResult$, this.filteredMaps$, this.filteredSearchApiResultMatches$),
    map(([searchTerm, selectedSearchResult, filteredMaps, filteredSearchApiResultMatches]) => {
      return (
        searchTerm.split(' ')[0].length >= 1 &&
        (filteredMaps.length !== 0 || filteredSearchApiResultMatches.length !== 0) &&
        !selectedSearchResult
      );
    }),
  );

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
    private readonly renderer: Renderer2,
  ) {}

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.selectedSearchResult$
        .pipe(
          tap((selectedSearchResult) => {
            if (selectedSearchResult) {
              this.searchComponent.setTerm(selectedSearchResult.displayString, false);
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.resultGroupsComponent.resultGroupComponents.changes.subscribe((resultGroupComponents: ResultGroupComponent[]) => {
        this.allSearchResults = [];
        resultGroupComponents.forEach((resultGroupComponent) => {
          this.allSearchResults = this.allSearchResults.concat(resultGroupComponent.searchResultElement.toArray());
        });
      }),
    );

    this.subscriptions.add(
      this.term$
        .pipe(
          filter((term) => term === ''),
          tap((term) => {
            this.searchComponent.setTerm(term, false);
          }),
        )
        .subscribe(),
    );
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, options: this.searchConfig.searchOptions}));
  }

  public clearSearchTerm() {
    this.store.dispatch(SearchActions.clearSearchTerm());
  }

  public openFilterMenu() {
    this.dialogService.open<SearchFilterDialogComponent>(SearchFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }

  public handleFocus() {
    if (this.screenMode === 'mobile') {
      this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'search'}));
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.searchState$.pipe(tap((searchState) => (this.searchState = searchState))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(this.isAnySearchFilterActive$.pipe(tap((value) => (this.isAnySearchFilterActive = value))).subscribe());
    this.subscriptions.add(this.listenToEvents$.pipe(tap((listenToEvents) => (this.listenToEvents = listenToEvents))).subscribe());
  }

  @HostListener('keydown.arrowdown', ['$event'])
  public handleArrowDown(event: KeyboardEvent) {
    this.handelArrowKey(event, 'down');
  }

  @HostListener('keydown.arrowup', ['$event'])
  public handleArrowUp(event: KeyboardEvent) {
    this.handelArrowKey(event, 'up');
  }

  @HostListener('keydown.tab', ['$event'])
  @HostListener('keydown.shift.tab', ['$event'])
  public handleTab() {
    // Timeout is necessary to wait until the default Event from Tab has finished
    setTimeout(() => {
      const focusedElement = this.allSearchResults.find((result) => result.host.nativeElement === document.activeElement);
      if (focusedElement) {
        this.selectedSearchResultIndex = this.allSearchResults.indexOf(focusedElement);
        this.setFocusOnSelectedElement();
      }
    }, 0);
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  public handleEnter() {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      const result = this.allSearchResults[this.selectedSearchResultIndex];
      result.host.nativeElement.click();
    }
  }

  private handelArrowKey(event: KeyboardEvent, direction: 'up' | 'down') {
    event.preventDefault();
    if (this.listenToEvents) {
      this.updateIndex(direction);
      this.setFocusOnSelectedElement();
    }
  }

  private updateIndex(direction: 'up' | 'down') {
    this.selectedResult?.removeTemporaryMap();
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

  private setFocusOnSelectedElement() {
    if (this.selectedSearchResultIndex >= 0 && this.allSearchResults.length > 0) {
      this.selectedResult = this.allSearchResults[this.selectedSearchResultIndex];
      this.searchComponent.setTerm(this.selectedResult.text, false);
      this.selectedResult.host.nativeElement.focus();
      this.selectedResult.addTemporaryMap();
    } else {
      this.searchComponent.inputRef.nativeElement.focus();
      this.searchComponent.setTerm(this.term, false);
    }
  }
}
