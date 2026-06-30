import {Component, inject} from '@angular/core';
import {MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
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
export class DataDownloadFilterDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadFilterDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);

  public readonly dataDownloadFilters = this.store.selectSignal(selectFilters);

  public trackByFilterLabel(_: number, item: DataDownloadFilter) {
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
