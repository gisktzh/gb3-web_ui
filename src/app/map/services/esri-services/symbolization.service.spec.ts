import {TestBed} from '@angular/core/testing';

import {SymbolizationService} from './symbolization.service';

describe('SymbolizationService', () => {
  let service: SymbolizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SymbolizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
