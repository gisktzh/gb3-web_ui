import {Component, Input, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import {Product, ProductFormat} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';
import {MatSelect} from '@angular/material/select';
import {BehaviorSubject, Subscription, tap} from 'rxjs';
import {MatCheckbox} from '@angular/material/checkbox';
import {NgClass, AsyncPipe} from '@angular/common';
import {MatTooltip} from '@angular/material/tooltip';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/autocomplete';
import {ExternalLinkButtonComponent} from '../../../../shared/components/external-link-button/external-link-button.component';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [
    MatCheckbox,
    NgClass,
    FormsModule,
    MatTooltip,
    ShowTooltipIfTruncatedDirective,
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    ExternalLinkButtonComponent,
    AsyncPipe,
  ],
})
export class ProductComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public product!: Product;
  @Input() public order!: Order;
  public isProductSelected: boolean = false;
  public readonly formatsFormControl: FormControl<ProductFormat[] | null> = new FormControl(null, []);

  protected readonly disabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  @ViewChild('formatsSelect') private matSelectRef?: MatSelect;
  private readonly subscription = new Subscription();

  @Input()
  public set disabled(value: boolean) {
    // Angular forms can't be disabled within the HTML template (there is a warning poping up as soon as [disabled] exists on a form element).
    // Therefore, this behaviour subject is used to expose the value to the HTML as well as to be able to subscribe to value changes from within this component
    // to apply it to the form control programmatically.
    this.disabled$.next(value);
  }

  public ngOnInit() {
    this.initializeSubscriptions();
    this.initializeProductFromOrder();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public toggleProduct() {
    if (this.isProductSelected) {
      this.openFormatSelect();
    }
    this.updateOrderProducts();
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

  private openFormatSelect() {
    // This is a workaround to open mat-select as soon as it's rendered within the DOM after clicking on the checkbox
    // because it is using a `*ngIf`
    setTimeout(() => this.matSelectRef?.open());
  }

  private initializeSubscriptions() {
    this.subscription.add(
      this.disabled$
        .pipe(
          tap((isDisabled) => {
            if (isDisabled) {
              this.formatsFormControl.disable();
            } else {
              this.formatsFormControl.enable();
            }
          }),
        )
        .subscribe(),
    );
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
