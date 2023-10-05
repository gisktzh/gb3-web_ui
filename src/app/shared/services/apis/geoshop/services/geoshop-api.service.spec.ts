import {TestBed} from '@angular/core/testing';

import {GeoshopApiService} from './geoshop-api.service';

describe('GeoshopApiService', () => {
  let service: GeoshopApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoshopApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
