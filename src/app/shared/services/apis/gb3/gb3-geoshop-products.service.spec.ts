import {TestBed} from '@angular/core/testing';

import {Gb3GeoshopProductsService} from './gb3-geoshop-products.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('Gb3GeoshopProductsService', () => {
  let service: Gb3GeoshopProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(Gb3GeoshopProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO GB3-651: Add unit test for filter extraction
});
