import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SharedModule} from '../../../shared.module';
import {SearchState} from '../../../../state/app/states/search.state';
import {initialState, selectSearchState} from '../../../../state/app/reducers/search.reducer';
import {ScreenMode} from '../../../types/screen-size.type';
import {ResultGroupsComponent} from '../../../../map/components/search-window/result-groups/result-groups.component';
import {selectScreenMode} from '../../../../state/app/reducers/app-layout.reducer';
import {selectIsAnySearchFilterActiveSelector} from '../../../../state/app/selectors/is-any-search-filter-active.selector';
import {ConfigService} from '../../../services/config.service';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {SearchActions} from '../../../../state/app/actions/search.actions';
import {Subscription, tap} from 'rxjs';
import {SearchFilterDialogComponent} from '../../search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../enums/panel-class.enum';
import {NgClass} from '@angular/common';
import {SearchInputComponent} from '../search-input.component';
import {SearchMode} from '../../../types/search-mode.type';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'search-bar',
  imports: [SharedModule, NgClass],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() public mode: SearchMode = 'normal';
  @Input() public placeholderText: string = 'Suche nach Karten, Kartendaten, Geodaten und Geodiensten';
  @Input() public searchConfig = this.configService.searchConfig.mapPage;
  @Input() public showFilterButton = true;
  @Input() public hasFocusEvent = false;

  public searchState: SearchState = initialState;
  public screenMode: ScreenMode = 'regular';
  public isAnySearchFilterActive: boolean = false;

  @ViewChild(SearchInputComponent) public readonly searchInput!: SearchInputComponent;
  @ViewChild(ResultGroupsComponent) private readonly resultGroupsComponent: ResultGroupsComponent | undefined;

  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly isAnySearchFilterActive$ = this.store.select(selectIsAnySearchFilterActiveSelector);
  private readonly subscriptions: Subscription = new Subscription();
  constructor(
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
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
    if (this.screenMode === 'mobile' && this.hasFocusEvent) {
      this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'search'}));
    }
  }

  private initSubscriptions() {
    this.subscriptions.add(this.searchState$.pipe(tap((searchState) => (this.searchState = searchState))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(this.isAnySearchFilterActive$.pipe(tap((value) => (this.isAnySearchFilterActive = value))).subscribe());
  }
}
