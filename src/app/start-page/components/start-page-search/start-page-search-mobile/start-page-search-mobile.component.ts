import {Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {SearchFilterDialogComponent} from 'src/app/shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from 'src/app/shared/enums/panel-class.enum';
import {ConfigService} from 'src/app/shared/services/config.service';
import {SearchActions} from 'src/app/state/app/actions/search.actions';
import {selectTerm} from 'src/app/state/app/reducers/search.reducer';
import {selectActiveSearchFilterValues} from 'src/app/state/data-catalogue/selectors/active-search-filters.selector';

const FILTER_DIALOG_WIDTH_IN_PX = 90;

@Component({
  selector: 'start-page-search-mobile',
  templateUrl: './start-page-search-mobile.component.html',
  styleUrls: ['./start-page-search-mobile.component.scss'],
})
export class StartPageSearchMobileComponent {
  @Input() focusOnInit: boolean = true;
  public activeSearchFilterValues: {groupLabel: string; filterLabel: string}[] = [];
  public searchTerms: string[] = [];

  private readonly searchConfig = this.configService.searchConfig.startPage;
  private readonly activeSearchFilterValues$ = this.store.select(selectActiveSearchFilterValues);
  private readonly searchTerm$ = this.store.select(selectTerm);

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
  ) {}

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
      width: `${FILTER_DIALOG_WIDTH_IN_PX}vw`,
    });
  }
}
