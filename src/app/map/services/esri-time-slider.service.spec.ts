import {TestBed} from '@angular/core/testing';

import {EsriTimeSliderService} from './esri-time-slider.service';

describe('EsriTimeSliderService', () => {
  let service: EsriTimeSliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriTimeSliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO WES: unit tests!
});
