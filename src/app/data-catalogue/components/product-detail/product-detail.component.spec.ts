import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {DepartmentalContact, ProductMetadata} from '../../../shared/interfaces/gb3-metadata.interface';
import {Gb3MetadataService} from '../../../shared/services/apis/gb3/gb3-metadata.service';
import {ConfigService} from '../../../shared/services/config.service';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {ProductDetailComponent} from './product-detail.component';

describe('ProductDetailComponent', () => {
  const contact: DepartmentalContact = {
    department: 'Office',
    division: null,
    section: null,
    firstName: 'Grace',
    lastName: 'Hopper',
    street: 'Main Street',
    houseNumber: 1,
    poBox: null,
    zipCode: 8000,
    village: 'Zurich',
    phone: '123',
    phoneDirect: '456',
    email: null,
    url: null,
  };
  const metadata: ProductMetadata = {
    uuid: 'product-1',
    gisZHNr: 73,
    name: 'Address product',
    description: 'A packaged product',
    imageUrl: null,
    contact: {metadata: contact},
    datasets: [{uuid: 'dataset-1', name: 'Addresses', shortDescription: 'All addresses', gisZHNr: 9}],
  };
  const loadProductDetail = vi.fn().mockReturnValue(of(metadata));

  beforeEach(async () => {
    loadProductDetail.mockReturnValue(of(metadata));
    const paramMap = convertToParamMap({id: 'product-1'});
    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideRouter([]),
        provideMockStore({selectors: [{selector: selectScreenMode, value: 'regular'}]}),
        {provide: ActivatedRoute, useValue: {paramMap: of(paramMap), snapshot: {paramMap}}},
        {provide: ConfigService, useValue: {apiConfig: {gb2StaticFiles: {baseUrl: 'https://static.example.com'}}}},
        {provide: Gb3MetadataService, useValue: {loadProductDetail}},
      ],
    })
      .overrideComponent(ProductDetailComponent, {set: {template: ''}})
      .compileComponents();
  });

  it('loads the route resource and exposes product display data', async () => {
    const fixture = TestBed.createComponent(ProductDetailComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(loadProductDetail).toHaveBeenCalledWith('product-1');
    expect(component.loadingState()).toBe('loaded');
    expect(component.baseMetadataInformation()).toEqual({
      itemTitle: 'Address product',
      category: 'Produkt',
      shortDescription: 'A packaged product',
      imageUrl: null,
    });
    expect(component.informationElements()).toEqual([{title: 'Nr.', value: '73', type: 'text'}]);
    expect(component.linkedDatasets()).toEqual(metadata.datasets);
    expect(component.metadataContactElements()).toContainEqual({title: 'Kontaktperson', value: 'Grace Hopper', type: 'text'});
  });
});
