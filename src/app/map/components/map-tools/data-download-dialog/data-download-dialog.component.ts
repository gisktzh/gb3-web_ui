import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {Subscription, tap} from 'rxjs';
import {selectOrder, selectSavingState} from '../../../../state/map/reducers/data-download-order.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';
import {selectDataDownloadProductState} from '../../../../state/map/reducers/data-download-product.reducer';
import {Product} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {selectRelevantProducts} from '../../../../state/map/selectors/data-download-relevant-products.selector';

@Component({
  selector: 'data-download-dialog',
  templateUrl: './data-download-dialog.component.html',
  styleUrls: ['./data-download-dialog.component.scss'],
})
export class DataDownloadDialogComponent implements OnInit, OnDestroy {
  public order?: Order;
  public savingState: LoadingState;
  public relevantProducts: Product[] = [];
  public relevantProductsLoadingState: LoadingState;
  public products: Product[] = [];
  public productsLoadingState: LoadingState;

  private readonly dataDownloadProductState$ = this.store.select(selectDataDownloadProductState);
  private readonly relevantProducts$ = this.store.select(selectRelevantProducts);
  private readonly order$ = this.store.select(selectOrder);
  private readonly savingState$ = this.store.select(selectSavingState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public download() {}

  public cancel() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  private initSubscriptions() {
    this.subscriptions.add(this.order$.pipe(tap((order) => (this.order = order))).subscribe());
    this.subscriptions.add(this.savingState$.pipe(tap((savingState) => (this.savingState = savingState))).subscribe());
    this.subscriptions.add(
      this.dataDownloadProductState$
        .pipe(
          tap((dataDownloadProductState) => {
            this.products = dataDownloadProductState.products;
            this.productsLoadingState = dataDownloadProductState.productsLoadingState;
            this.relevantProductsLoadingState = dataDownloadProductState.relevantProductIdsLoadingState;
          }),
        )
        .subscribe(),
    );
    this.subscriptions.add(this.relevantProducts$.pipe(tap((relevantProducts) => (this.relevantProducts = relevantProducts))).subscribe());
  }
}
