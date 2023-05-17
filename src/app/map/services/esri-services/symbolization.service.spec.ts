import {TestBed} from '@angular/core/testing';

import {EsriSymbolizationService} from './esri-symbolization.service';

describe('SymbolizationService', () => {
  let service: EsriSymbolizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriSymbolizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
