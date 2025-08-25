import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';
import {Observable, Subscription, tap} from 'rxjs';
import {selectFilters} from '../../../state/data-catalogue/reducers/data-catalogue.reducer';
import {Store} from '@ngrx/store';
import {DataCatalogueActions} from '../../../state/data-catalogue/actions/data-catalogue.actions';
import {DataCatalogueFilterKey} from '../../../shared/types/data-catalogue-filter.type';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {CdkAccordion} from '@angular/cdk/accordion';
import {AccordionItemComponent} from '../../../shared/components/accordion-item/accordion-item.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'data-catalogue-filter-dialog',
  templateUrl: './data-catalogue-filter-dialog.component.html',
  styleUrls: ['./data-catalogue-filter-dialog.component.scss'],
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
export class DataCatalogueFilterDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject<MatDialogRef<DataCatalogueFilterDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);

  public dataCatalogueFilters: DataCatalogueFilter[] = [];
  private readonly dataCatalogueFilters$: Observable<DataCatalogueFilter[]> = this.store.select(selectFilters);
  private readonly subscriptions: Subscription = new Subscription();

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
