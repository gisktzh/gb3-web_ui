import {TestBed} from '@angular/core/testing';

import {SwisstopoApiService} from './swisstopo-api.service';

describe('SwisstopoApiService', () => {
  let service: SwisstopoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwisstopoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
