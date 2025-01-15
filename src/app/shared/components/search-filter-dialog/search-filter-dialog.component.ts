import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectFilterGroups} from '../../../state/app/reducers/search.reducer';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {MatDialogRef} from '@angular/material/dialog';
import {SearchFilter, SearchFilterGroup} from '../../interfaces/search-filter-group.interface';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';

@Component({
  selector: 'search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss'],
  standalone: false,
})
export class SearchFilterDialogComponent implements OnInit, OnDestroy {
  public nonEmptyFilterGroups: SearchFilterGroup[] = [];
  public screenMode: ScreenMode = 'regular';

  private readonly filterGroups$ = this.store.select(selectFilterGroups);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<SearchFilterDialogComponent>,
  ) {}

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
