import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {selectOrder, selectSavingState} from '../../../../state/map/reducers/data-download-order.reducer';
import {
  selectProductsLoadingState,
  selectRelevantProductIdsLoadingState,
} from '../../../../state/map/reducers/data-download-product.reducer';
import {Product} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectFilteredRelevantProducts} from '../../../../state/map/selectors/filtered-relevant-products.selector';
import {DataDownloadProductActions} from '../../../../state/map/actions/data-download-product.actions';
import {DataDownloadFilterCategory} from '../../../../shared/interfaces/data-download-filter.interface';
import {MatDialog} from '@angular/material/dialog';
import {DataDownloadFilterDialogComponent} from '../data-download-filter-dialog/data-download-filter-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {selectFilteredProducts} from '../../../../state/map/selectors/filtered-products.selector';
import {DataDownloadEmailDialogComponent} from '../data-download-email-dialog/data-download-email-dialog.component';
import {selectActiveDataDownloadFiltersPerCategory} from '../../../../state/map/selectors/active-data-download-filters-per-category.selector';
import {MatIconButton, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SearchInputComponent} from '../../../../shared/components/search/search-input.component';
import {ExpandableListItemComponent} from '../../../../shared/components/expandable-list-item/expandable-list-item.component';
import {ProductComponent} from '../product/product.component';
import {MatDivider} from '@angular/material/divider';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';

@Component({
  selector: 'data-download-dialog',
  templateUrl: './data-download-dialog.component.html',
  styleUrls: ['./data-download-dialog.component.scss'],
  imports: [
    MatIconButton,
    MatIcon,
    SearchInputComponent,
    ExpandableListItemComponent,
    ProductComponent,
    MatDivider,
    LoadingAndProcessBarComponent,
    MatButton,
  ],
})
export class DataDownloadDialogComponent {
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);

  public readonly order = this.store.selectSignal(selectOrder);
  public readonly savingState = this.store.selectSignal(selectSavingState);
  public readonly relevantProducts = this.store.selectSignal(selectFilteredRelevantProducts);
  public readonly relevantProductsLoadingState = this.store.selectSignal(selectRelevantProductIdsLoadingState);
  public readonly filteredProducts = this.store.selectSignal(selectFilteredProducts);
  public readonly productsLoadingState = this.store.selectSignal(selectProductsLoadingState);
  public readonly activeDataDownloadFiltersPerCategory = this.store.selectSignal(selectActiveDataDownloadFiltersPerCategory);

  public trackByProductId(_: number, item: Product) {
    return item.id;
  }

  public setFilterTerm(term: string) {
    this.store.dispatch(DataDownloadProductActions.setFilterTerm({term}));
  }

  public clearFilterTerm() {
    this.store.dispatch(DataDownloadProductActions.clearFilterTerm());
  }

  public openFilterWindow() {
    this.dialogService.open<DataDownloadFilterDialogComponent>(DataDownloadFilterDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }

  public toggleFilter(category: DataDownloadFilterCategory, value: string) {
    this.store.dispatch(DataDownloadProductActions.toggleFilter({category, value}));
  }

  public openDownloadDialog() {
    this.dialogService.open<DataDownloadEmailDialogComponent, {orderEmail: string | undefined}>(DataDownloadEmailDialogComponent, {
      data: {orderEmail: this.order()?.email},
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }

  public cancel() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }
}
