import {Component, Input, OnInit} from '@angular/core';
import {Product, ProductFormat} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {FormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  @Input() public product!: Product;
  @Input() public order!: Order;
  public isProductSelected: boolean = false;
  public readonly formatsFormControl: FormControl<ProductFormat[] | null> = new FormControl(null, []);

  private _disabled: boolean = false;

  @Input() public set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.formatsFormControl.disable();
    } else {
      this.formatsFormControl.enable();
    }
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initializeProductFromOrder();
  }

  public updateOrderProducts() {
    const productFormats = this.formatsFormControl.value ?? [];
    if (this.isProductSelected) {
      this.store.dispatch(
        DataDownloadOrderActions.updateProductsInOrder({
          productId: this.product.gisZHNr,
          formatIds: productFormats.map((productFormat) => productFormat.id),
        }),
      );
    } else {
      this.store.dispatch(DataDownloadOrderActions.removeProductsWithSameIdInOrder({productId: this.product.gisZHNr}));
    }
  }

  private initializeProductFromOrder() {
    const orderProducts = this.order.products.filter((product) => product.id === this.product.gisZHNr);
    this.isProductSelected = orderProducts.length > 0;
    const productFormats: ProductFormat[] = [];
    orderProducts.forEach((orderProduct) => {
      const productFormat = this.product.formats.find((format) => orderProduct.formatId === format.id);
      if (productFormat) {
        productFormats.push(productFormat);
      }
    });
    if (productFormats.length > 0) {
      this.formatsFormControl.setValue(productFormats);
    }
  }
}
