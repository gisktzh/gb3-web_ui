import {TestBed} from '@angular/core/testing';

import {EsriToolService} from './esri-tool.service';

describe('EsriToolService', () => {
  let service: EsriToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
