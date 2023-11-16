import {Component, Input} from '@angular/core';
import {Product, ProductFormat} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {FormControl} from '@angular/forms';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  @Input() public product!: Product;

  public readonly formatsFormControl: FormControl<ProductFormat[] | null> = new FormControl(null, []);

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

  private _disabled: boolean = false;

  constructor(private readonly store: Store) {}

  public updateOrderProductWithThisId(checked: boolean) {
    if (!checked) {
      this.store.dispatch(DataDownloadOrderActions.removeProductsWithSameIdInOrder({productId: this.product.gisZHNr}));
    } else if (this.formatsFormControl.value) {
      this.store.dispatch(
        DataDownloadOrderActions.updateProductsInOrder({
          productId: this.product.gisZHNr,
          formatIds: this.formatsFormControl.value.map((productFormat) => productFormat.id),
        }),
      );
    }
  }

  public updateOrderProducts(productFormats: ProductFormat[]) {
    this.store.dispatch(
      DataDownloadOrderActions.updateProductsInOrder({
        productId: this.product.gisZHNr,
        formatIds: productFormats.map((productFormat) => productFormat.id),
      }),
    );
  }
}
