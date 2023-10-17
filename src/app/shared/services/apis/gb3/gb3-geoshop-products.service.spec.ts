import {TestBed} from '@angular/core/testing';

import {Gb3GeoshopProductsService} from './gb3-geoshop-products.service';

describe('Gb3GeoshopProductsService', () => {
  let service: Gb3GeoshopProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Gb3GeoshopProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
