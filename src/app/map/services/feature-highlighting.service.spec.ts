import {TestBed} from '@angular/core/testing';

import {FeatureHighlightingService} from './feature-highlighting.service';

describe('FeatureHighlightingService', () => {
  let service: FeatureHighlightingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureHighlightingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
