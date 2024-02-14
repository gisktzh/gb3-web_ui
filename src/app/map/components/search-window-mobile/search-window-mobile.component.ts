import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {SearchFilterDialogComponent} from 'src/app/shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from 'src/app/shared/enums/panel-class.enum';
import {ConfigService} from 'src/app/shared/services/config.service';
import {SearchActions} from 'src/app/state/app/actions/search.actions';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';
import {selectSelectedSearchResult, selectTerm} from '../../../state/app/reducers/search.reducer';
import {SearchComponent} from '../../../shared/components/search/search.component';
import {GeometrySearchApiResultMatch} from '../../../shared/services/apis/search/interfaces/search-api-result-match.interface';

@Component({
  selector: 'search-window-mobile',
  templateUrl: './search-window-mobile.component.html',
  styleUrls: ['./search-window-mobile.component.scss'],
})
export class SearchWindowMobileComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() public focusOnInit: boolean = true;
  public isAnySearchFilterActive: boolean = false;
  public selectedSearchResult?: GeometrySearchApiResultMatch;

  @ViewChild(SearchComponent) private readonly searchComponent!: SearchComponent;

  private readonly searchConfig = this.configService.searchConfig.mapPage;
  private readonly isAnySearchFilterActive$ = this.store.select(selectIsAnySearchFilterActiveSelector);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);
  private readonly term$ = this.store.select(selectTerm);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly dialogService: MatDialog,
    private readonly configService: ConfigService,
  ) {}

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.selectedSearchResult$
        .pipe(
          tap((selectedSearchResult) => {
            this.selectedSearchResult = selectedSearchResult;
            if (selectedSearchResult) {
              // This is necessary to avoid NG100 ExpressionChangedAfterItHasBeenCheckedError
              setTimeout(() => {
                this.searchComponent.setTerm(selectedSearchResult?.displayString ?? '', false);
              }, 0);
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.term$
        .pipe(
          tap((term) => {
            if (!this.selectedSearchResult) {
              // This is necessary to avoid NG100 ExpressionChangedAfterItHasBeenCheckedError
              setTimeout(() => {
                this.searchComponent.setTerm(term, false);
              }, 0);
            }
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

  private initSubscriptions() {
    this.subscriptions.add(this.isAnySearchFilterActive$.pipe(tap((value) => (this.isAnySearchFilterActive = value))).subscribe());
  }
}
