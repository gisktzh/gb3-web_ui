import {Component, inject, input, viewChild} from '@angular/core';
import {SharedModule} from '../../../shared.module';
import {selectSearchState} from '../../../../state/app/reducers/search.reducer';
import {selectScreenMode} from '../../../../state/app/reducers/app-layout.reducer';
import {selectIsAnySearchFilterActiveSelector} from '../../../../state/app/selectors/is-any-search-filter-active.selector';
import {ConfigService} from '../../../services/config.service';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {SearchActions} from '../../../../state/app/actions/search.actions';
import {SearchFilterDialogComponent} from '../../search-filter-dialog/search-filter-dialog.component';
import {PanelClass} from '../../../enums/panel-class.enum';

import {SearchInputComponent} from '../search-input.component';
import {SearchMode} from '../../../types/search-mode.type';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'search-bar',
  imports: [SharedModule, SearchInputComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  private readonly configService = inject(ConfigService);
  private readonly dialogService = inject(MatDialog);
  private readonly store = inject(Store);

  public readonly searchInput = viewChild.required(SearchInputComponent);

  public readonly mode = input<SearchMode>('normal');
  public readonly placeholderText = input('Suche nach Karten, Kartendaten, Geodaten und Geodiensten');
  public readonly searchConfig = input(this.configService.searchConfig.mapPage);
  public readonly showFilterButton = input(true);
  public readonly hasFocusEvent = input(false);

  public readonly searchState = this.store.selectSignal(selectSearchState);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly isAnySearchFilterActive = this.store.selectSignal(selectIsAnySearchFilterActiveSelector);

  constructor() {
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig().filterGroups}));
  }

  public searchForTerm(term: string) {
    this.store.dispatch(SearchActions.searchForTerm({term, options: this.searchConfig().searchOptions}));
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
    if (this.screenMode() === 'mobile' && this.hasFocusEvent()) {
      this.store.dispatch(MapUiActions.showBottomSheet({bottomSheetContent: 'search'}));
    }
  }
}
