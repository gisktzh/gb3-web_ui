import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {Observable, Subscription, tap} from 'rxjs';
import {selectFilters} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {DataCatalogueFilterKey} from '../../../shared/types/data-catalogue-filter';

@Component({
  selector: 'data-catalogue-filter-dialog',
  templateUrl: './data-catalogue-filter-dialog.component.html',
  styleUrls: ['./data-catalogue-filter-dialog.component.scss'],
})
export class DataCatalogueFilterDialogComponent implements OnInit, OnDestroy {
  public dataCatalogueFilters: DataCatalogueFilter[] = [];
  private readonly dataCatalogueFilters$: Observable<DataCatalogueFilter[]> = this.store.select(selectFilters);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<DataCatalogueFilterDialogComponent>,
    private readonly store: Store,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.subscriptions.add(
      this.dataCatalogueFilters$.pipe(tap((dataCatalogueFilters) => (this.dataCatalogueFilters = dataCatalogueFilters))).subscribe(),
    );
  }

  public trackByFilterLabel(index: number, item: DataCatalogueFilter) {
    return item.label;
  }

  public toggleFilter(key: DataCatalogueFilterKey, filterValue: string) {
    this.store.dispatch(DataCatalogueActions.toggleFilter({key, value: filterValue}));
  }

  public resetFilters() {
    this.store.dispatch(DataCatalogueActions.resetFilters());
  }

  public close() {
    this.dialogRef.close();
  }
}
