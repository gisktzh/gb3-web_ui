import {TestBed} from '@angular/core/testing';

import {LayerService} from './layer.service';

describe('LayerService', () => {
  let service: LayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
