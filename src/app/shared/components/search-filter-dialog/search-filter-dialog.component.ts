import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectFilterGroups} from '../../../state/app/reducers/search.reducer';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {SearchFilter, SearchFilterGroup} from '../../interfaces/search-filter-group.interface';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';
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
export class SearchFilterDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<SearchFilterDialogComponent>>(MatDialogRef);

  public nonEmptyFilterGroups: SearchFilterGroup[] = [];
  public screenMode: ScreenMode = 'regular';

  private readonly filterGroups$ = this.store.select(selectFilterGroups);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public toggleFilter(groupLabel: string, filterLabel: string, isActive: boolean) {
    this.store.dispatch(SearchActions.setFilterValue({groupLabel, filterLabel, isActive}));
  }

  public resetFilters() {
    this.store.dispatch(SearchActions.resetFilters());
  }

  public close() {
    this.dialogRef.close();
  }

  public trackByFilterGroupLabel(index: number, item: SearchFilterGroup): string {
    return item.label;
  }

  public trackByFilterLabel(index: number, item: SearchFilter): string {
    return item.label;
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.filterGroups$
        .pipe(tap((filterGroups) => (this.nonEmptyFilterGroups = filterGroups.filter((group) => group.filters.length > 0))))
        .subscribe(),
    );
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
