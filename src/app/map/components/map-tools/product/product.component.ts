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
  public isProductSelected: boolean = false;

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

  public setIsProductSelected(isProductSelected: boolean) {
    this.isProductSelected = isProductSelected;
    this.updateOrderProducts(this.formatsFormControl.value ?? []);
  }

  public updateOrderProducts(productFormats: ProductFormat[]) {
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
}
