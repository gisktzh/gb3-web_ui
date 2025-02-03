import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {filter, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {SearchFilterDialogComponent} from '../../../shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {initialState, selectSearchState, selectSelectedSearchResult} from '../../../state/app/reducers/search.reducer';
import {SearchState} from '../../../state/app/states/search.state';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';
import {ResultGroupsComponent} from './result-groups/result-groups.component';
import {ResultGroupComponent} from './result-groups/result-group/result-group.component';
import {BaseSearchContainerComponent} from '../../../shared/components/search/base-search-container/base-search-container.component';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss'],
  standalone: false,
})
export class SearchWindowComponent extends BaseSearchContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchState: SearchState = initialState;
  public screenMode: ScreenMode = 'regular';
  public isAnySearchFilterActive: boolean = false;

  @ViewChild(ResultGroupsComponent) private readonly resultGroupsComponent: ResultGroupsComponent | undefined;

  private readonly searchConfig = this.configService.searchConfig.mapPage;
  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly isAnySearchFilterActive$ = this.store.select(selectIsAnySearchFilterActiveSelector);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);
  constructor(
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
    @Inject(Store) store: Store,
    @Inject(ChangeDetectorRef) cdr: ChangeDetectorRef,
  ) {
    super(store, cdr);
  }

  public override ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }

  public override ngAfterViewInit() {
    super.ngAfterViewInit();
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

    if (this.resultGroupsComponent) {
      this.subscriptions.add(
        this.resultGroupsComponent.resultGroupComponents.changes.subscribe((resultGroupComponents: ResultGroupComponent[]) => {
          this.allSearchResults = [];
          resultGroupComponents.forEach((resultGroupComponent) => {
            this.allSearchResults = this.allSearchResults.concat(resultGroupComponent.searchResultElements.toArray());
          });
          this.cdr.detectChanges();
        }),
      );
    }

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
    // Necessary because we are passing the searchComponent to the searchResultKeyboardNavigation directive
    this.cdr.detectChanges();
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
  }
}
