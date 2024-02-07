import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {SearchFilterDialogComponent} from 'src/app/shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from 'src/app/shared/enums/panel-class.enum';
import {ConfigService} from 'src/app/shared/services/config.service';
import {SearchActions} from 'src/app/state/app/actions/search.actions';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';

@Component({
  selector: 'search-window-mobile',
  templateUrl: './search-window-mobile.component.html',
  styleUrls: ['./search-window-mobile.component.scss'],
})
export class SearchWindowMobileComponent implements OnInit, OnDestroy {
  @Input() focusOnInit: boolean = true;
  public isAnySearchFilterActive: boolean = false;

  private readonly searchConfig = this.configService.searchConfig.mapPage;
  private readonly isAnySearchFilterActive$ = this.store.select(selectIsAnySearchFilterActiveSelector);
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
