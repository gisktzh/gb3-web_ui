import {Component, computed, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectFilterGroups} from '../../../state/app/reducers/search.reducer';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {SearchFilter, SearchFilterGroup} from '../../interfaces/search-filter-group.interface';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {CdkAccordion} from '@angular/cdk/accordion';
import {AccordionItemComponent} from '../accordion-item/accordion-item.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    CdkAccordion,
    AccordionItemComponent,
    MatCheckbox,
    MatDialogActions,
    MatButton,
  ],
})
export class SearchFilterDialogComponent {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<SearchFilterDialogComponent>>(MatDialogRef);

  public readonly filterGroups = this.store.selectSignal(selectFilterGroups);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly nonEmptyFilterGroups = computed(() => this.filterGroups().filter((group) => group.filters.length > 0));

  public toggleFilter(groupLabel: string, filterLabel: string, isActive: boolean) {
    this.store.dispatch(SearchActions.setFilterValue({groupLabel, filterLabel, isActive}));
  }

  public resetFilters() {
    this.store.dispatch(SearchActions.resetFilters());
  }

  public close() {
    this.dialogRef.close();
  }

  public trackByFilterGroupLabel(_: number, item: SearchFilterGroup): string {
    return item.label;
  }

  public trackByFilterLabel(_: number, item: SearchFilter): string {
    return item.label;
  }
}
