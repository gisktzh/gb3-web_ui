import {Component, Input} from '@angular/core';
import {Product} from '../../../../shared/interfaces/gb3-geoshop-product.interface';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent {
  @Input() public product!: Product;
}
