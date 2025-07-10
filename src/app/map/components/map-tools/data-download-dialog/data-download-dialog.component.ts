import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {Subscription, tap} from 'rxjs';
import {selectOrder, selectSavingState} from '../../../../state/map/reducers/data-download-order.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';
import {
  selectProductsLoadingState,
  selectRelevantProductIdsLoadingState,
} from '../../../../state/map/reducers/data-download-product.reducer';
import {Product} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectFilteredRelevantProducts} from '../../../../state/map/selectors/filtered-relevant-products.selector';
import {DataDownloadProductActions} from '../../../../state/map/actions/data-download-product.actions';
import {ActiveDataDownloadFilterGroup, DataDownloadFilterCategory} from '../../../../shared/interfaces/data-download-filter.interface';
import {MatDialog} from '@angular/material/dialog';
import {DataDownloadFilterDialogComponent} from '../data-download-filter-dialog/data-download-filter-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {selectFilteredProducts} from '../../../../state/map/selectors/filtered-products.selector';
import {DataDownloadEmailDialogComponent} from '../data-download-email-dialog/data-download-email-dialog.component';
import {selectActiveDataDownloadFiltersPerCategory} from '../../../../state/map/selectors/active-data-download-filters-per-category.selector';

@Component({
  selector: 'data-download-dialog',
  templateUrl: './data-download-dialog.component.html',
  styleUrls: ['./data-download-dialog.component.scss'],
  standalone: false,
})
export class DataDownloadDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);

  public order?: Order;
  public savingState: LoadingState;
  public relevantProducts: Product[] = [];
  public relevantProductsLoadingState: LoadingState;
  public filteredProducts: Product[] = [];
  public productsLoadingState: LoadingState;
  public activeDataDownloadFiltersPerCategory: ActiveDataDownloadFilterGroup[] = [];

  private readonly order$ = this.store.select(selectOrder);
  private readonly savingState$ = this.store.select(selectSavingState);
  private readonly relevantProducts$ = this.store.select(selectFilteredRelevantProducts);
  private readonly relevantProductsLoadingState$ = this.store.select(selectRelevantProductIdsLoadingState);
  private readonly filteredProducts$ = this.store.select(selectFilteredProducts);
  private readonly productsLoadingState$ = this.store.select(selectProductsLoadingState);
  private readonly activeDataDownloadFiltersPerCategory$ = this.store.select(selectActiveDataDownloadFiltersPerCategory);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public trackByProductId(index: number, item: Product) {
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
      data: {orderEmail: this.order?.email},
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
    });
  }

  public cancel() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.order$.pipe(tap((order) => (this.order = order))).subscribe());
    this.subscriptions.add(this.savingState$.pipe(tap((savingState) => (this.savingState = savingState))).subscribe());
    this.subscriptions.add(this.relevantProducts$.pipe(tap((relevantProducts) => (this.relevantProducts = relevantProducts))).subscribe());
    this.subscriptions.add(
      this.relevantProductsLoadingState$.pipe(tap((loadingState) => (this.relevantProductsLoadingState = loadingState))).subscribe(),
    );
    this.subscriptions.add(this.filteredProducts$.pipe(tap((filteredProducts) => (this.filteredProducts = filteredProducts))).subscribe());
    this.subscriptions.add(this.productsLoadingState$.pipe(tap((loadingState) => (this.productsLoadingState = loadingState))).subscribe());
    this.subscriptions.add(
      this.activeDataDownloadFiltersPerCategory$.pipe(tap((value) => (this.activeDataDownloadFiltersPerCategory = value))).subscribe(),
    );
  }
}
