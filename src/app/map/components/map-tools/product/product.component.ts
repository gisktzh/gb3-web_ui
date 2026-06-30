import {Component, computed, inject, input, signal, viewChild} from '@angular/core';
import {Product, ProductFormat} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';
import {MatSelect} from '@angular/material/select';
import {MatCheckbox} from '@angular/material/checkbox';

import {MatTooltip} from '@angular/material/tooltip';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/autocomplete';
import {ExternalLinkButtonComponent} from '../../../../shared/components/external-link-button/external-link-button.component';
import {disabled, form, FormField} from '@angular/forms/signals';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [
    MatCheckbox,
    MatTooltip,
    FormsModule,
    ShowTooltipIfTruncatedDirective,
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    ExternalLinkButtonComponent,
  ],
})
export class ProductComponent {
  private readonly store = inject(Store);

  public readonly product = input.required<Product>();
  public readonly order = input<Order>();
  public readonly disabled = input(false);

  public readonly orderProducts = computed(() => (this.order()?.products || []).filter((product) => product.id === this.product().gisZHNr));
  public readonly isProductSelected = signal(this.orderProducts().length > 0);
  public readonly selectableFormats = computed(() => {
    const productFormats: ProductFormat[] = [];
    this.orderProducts().forEach((orderProduct) => {
      const productFormat = this.product().formats.find((format) => orderProduct.formatId === format.id);
      if (productFormat) {
        productFormats.push(productFormat);
      }
    });
    return productFormats;
  });
  public readonly formatsFormModel = signal<{formats: ProductFormat[]}>({
    formats: this.selectableFormats(),
  });
  public readonly formatsForm = form(this.formatsFormModel, (fieldPath) => {
    disabled(fieldPath.formats, () => this.disabled());
  });

  public readonly matSelectRef = viewChild<MatSelect>('formatsSelect');

  public toggleProduct() {
    if (this.isProductSelected()) {
      this.openFormatSelect();
    }
    this.updateOrderProducts();
  }

  public updateOrderProducts() {
    const productFormats = this.formatsFormModel().formats ?? [];
    if (this.isProductSelected()) {
      this.store.dispatch(
        DataDownloadOrderActions.updateProductsInOrder({
          productId: this.product().gisZHNr,
          formatIds: productFormats.map((productFormat) => productFormat.id),
        }),
      );
    } else {
      this.store.dispatch(DataDownloadOrderActions.removeProductsWithSameIdInOrder({productId: this.product().gisZHNr}));
    }
  }

  private openFormatSelect() {
    // This is a workaround to open mat-select as soon as it's rendered within the DOM after clicking on the checkbox
    // because it is using a `*ngIf`
    setTimeout(() => this.matSelectRef()?.open());
  }
}
