import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {SearchFilterDialogComponent} from '../../../shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {initialState, selectSearchState} from '../../../state/app/reducers/search.reducer';
import {SearchState} from '../../../state/app/states/search.state';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss'],
})
export class SearchWindowComponent implements OnInit, OnDestroy {
  public searchState: SearchState = initialState;
  public screenMode: ScreenMode = 'regular';

  private readonly searchConfig = this.configService.searchConfig.mapPage;
  private readonly searchState$ = this.store.select(selectSearchState);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly dialogService: MatDialog,
  ) {}

  public ngOnInit() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(SearchActions.resetSearchAndFilters());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.searchState$.pipe(tap((searchState) => (this.searchState = searchState))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
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
}
