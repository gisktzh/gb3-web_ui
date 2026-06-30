import {Component, effect, inject, input, untracked, viewChild} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {SearchFilterDialogComponent} from 'src/app/shared/components/search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from 'src/app/shared/enums/panel-class.enum';
import {ConfigService} from 'src/app/shared/services/config.service';
import {SearchActions} from 'src/app/state/app/actions/search.actions';
import {selectIsAnySearchFilterActiveSelector} from '../../../state/app/selectors/is-any-search-filter-active.selector';
import {selectSelectedSearchResult, selectTerm} from '../../../state/app/reducers/search.reducer';
import {SearchInputComponent} from '../../../shared/components/search/search-input.component';
import {ResultGroupsComponent} from '../search-window/result-groups/result-groups.component';

@Component({
  selector: 'search-window-mobile',
  templateUrl: './search-window-mobile.component.html',
  styleUrls: ['./search-window-mobile.component.scss'],
  imports: [SearchInputComponent, ResultGroupsComponent],
})
export class SearchWindowMobileComponent {
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);
  private readonly configService = inject(ConfigService);

  public readonly focusOnInit = input(true);
  public readonly isAnySearchFilterActive = this.store.selectSignal(selectIsAnySearchFilterActiveSelector);
  public readonly selectedSearchResult = this.store.selectSignal(selectSelectedSearchResult);
  public readonly searchTerm = this.store.selectSignal(selectTerm);
  private readonly searchComponent = viewChild.required<SearchInputComponent>(SearchInputComponent);
  private readonly searchConfig = this.configService.searchConfig.mapPage;

  constructor() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));

    effect(() => {
      const selectedSearchresult = this.selectedSearchResult();
      if (selectedSearchresult) {
        queueMicrotask(() => {
          this.searchComponent().setTerm(selectedSearchresult.displayString ?? '', false);
        });
      }
    });

    effect(() => {
      if (!untracked(() => this.selectedSearchResult())) {
        const searchTerm = this.searchTerm();
        queueMicrotask(() => {
          this.searchComponent().setTerm(searchTerm ?? '', false);
        });
      }
    });
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
}
