import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {SearchFilterDialogComponent} from '../../../shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectTerm} from '../../../state/app/reducers/search.reducer';
import {selectActiveSearchFilterValues} from '../../../state/data-catalogue/selectors/active-search-filters.selector';

@Component({
  selector: 'start-page-search',
  templateUrl: './start-page-search.component.html',
  styleUrls: ['./start-page-search.component.scss'],
})
export class StartPageSearchComponent implements OnInit, OnDestroy {
  public searchTerms: string[] = [];
  public activeSearchFilterValues: {groupLabel: string; filterLabel: string}[] = [];
  public screenMode: ScreenMode = 'regular';

  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly searchTerm$ = this.store.select(selectTerm);
  private readonly activeSearchFilterValues$ = this.store.select(selectActiveSearchFilterValues);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, options: this.searchConfig.searchOptions}));
  }

  public clearSearchTerm() {
    this.store.dispatch(SearchActions.clearSearchTerm());
  }

  public deactivateFilter(groupLabel: string, filterLabel: string) {
    this.store.dispatch(SearchActions.setFilterValue({groupLabel, filterLabel, isActive: false}));
  }

  public openFilterMenu() {
    this.dialogService.open<SearchFilterDialogComponent>(SearchFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.searchTerm$
        .pipe(
          tap((searchTerm) => {
            if (searchTerm === '') {
              this.searchTerms = [];
            } else {
              this.searchTerms = searchTerm.split(' ');
            }
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(
      this.activeSearchFilterValues$
        .pipe(tap((activeSearchFilterValues) => (this.activeSearchFilterValues = activeSearchFilterValues)))
        .subscribe(),
    );
  }
}
