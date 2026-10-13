import {inputBinding, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Product} from '../../../../shared/interfaces/gb3-geoshop-product.interface';
import {Order} from '../../../../shared/interfaces/geoshop-order.interface';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {ProductComponent} from './product.component';

describe('ProductComponent', () => {
  const product = signal<Product>({
    id: 'product-1',
    gisZHNr: 42,
    ogd: true,
    name: 'Roads',
    keywords: [],
    themes: [],
    formats: [
      {id: 1, description: 'GeoPackage'},
      {id: 2, description: 'Shape'},
    ],
  });
  const order = signal<Order>({
    perimeterType: 'indirect',
    layerName: 'commune',
    identifiers: [],
    products: [{id: 42, formatId: 1}],
  });
  let fixture: ComponentFixture<ProductComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [ProductComponent], providers: [provideMockStore()]})
      .overrideComponent(ProductComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ProductComponent, {
      bindings: [inputBinding('product', product), inputBinding('order', order)],
    });
    fixture.detectChanges();
  });

  it('derives the selected formats from the existing order', () => {
    expect(fixture.componentInstance.selectableFormats()).toEqual([{id: 1, description: 'GeoPackage'}]);
  });

  it('updates selected formats in the order', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.formatsFormModel.set({formats: [product().formats[1]]});
    fixture.componentInstance.isProductSelected.set(true);
    fixture.componentInstance.updateOrderProducts();
    expect(dispatch).toHaveBeenCalledWith(DataDownloadOrderActions.updateProductsInOrder({productId: 42, formatIds: [2]}));
  });

  it('removes the product when deselected', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.isProductSelected.set(false);
    fixture.componentInstance.updateOrderProducts();
    expect(dispatch).toHaveBeenCalledWith(DataDownloadOrderActions.removeProductsWithSameIdInOrder({productId: 42}));
  });
});
