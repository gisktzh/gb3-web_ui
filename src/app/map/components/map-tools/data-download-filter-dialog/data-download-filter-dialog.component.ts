import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataDownloadFilter, DataDownloadFilterCategory} from '../../../../shared/interfaces/data-download-filter.interface';
import {selectFilters} from '../../../../state/map/reducers/data-download-product.reducer';
import {DataDownloadProductActions} from '../../../../state/map/actions/data-download-product.actions';

@Component({
  selector: 'data-download-filter-dialog',
  templateUrl: './data-download-filter-dialog.component.html',
  styleUrls: ['./data-download-filter-dialog.component.scss'],
})
export class DataDownloadFilterDialogComponent implements OnInit, OnDestroy {
  public dataDownloadFilters: DataDownloadFilter[] = [];
  private readonly dataDownloadFilters$: Observable<DataDownloadFilter[]> = this.store.select(selectFilters);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<DataDownloadFilterDialogComponent>,
    private readonly store: Store,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.subscriptions.add(
      this.dataDownloadFilters$.pipe(tap((dataDownloadFilters) => (this.dataDownloadFilters = dataDownloadFilters))).subscribe(),
    );
  }

  public trackByFilterLabel(index: number, item: DataDownloadFilter) {
    return item.label;
  }

  public toggleFilter(category: DataDownloadFilterCategory, filterValue: string) {
    this.store.dispatch(DataDownloadProductActions.toggleFilter({category, value: filterValue}));
  }

  public resetFilters() {
    this.store.dispatch(DataDownloadProductActions.resetFilters());
  }

  public close() {
    this.dialogRef.close();
  }
}
