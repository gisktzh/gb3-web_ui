import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {Observable, Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {DataDownloadFilter, DataDownloadFilterCategory} from '../../../../shared/interfaces/data-download-filter.interface';
import {selectFilters} from '../../../../state/map/reducers/data-download-product.reducer';
import {DataDownloadProductActions} from '../../../../state/map/actions/data-download-product.actions';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {CdkAccordion} from '@angular/cdk/accordion';
import {AccordionItemComponent} from '../../../../shared/components/accordion-item/accordion-item.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'data-download-filter-dialog',
  templateUrl: './data-download-filter-dialog.component.html',
  styleUrls: ['./data-download-filter-dialog.component.scss'],
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
export class DataDownloadFilterDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadFilterDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);

  public dataDownloadFilters: DataDownloadFilter[] = [];
  private readonly dataDownloadFilters$: Observable<DataDownloadFilter[]> = this.store.select(selectFilters);
  private readonly subscriptions: Subscription = new Subscription();

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
