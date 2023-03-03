import {TestBed} from '@angular/core/testing';

import {EsriTimesliderService} from './esri-timeslider.service';

describe('EsriTimesliderService', () => {
  let service: EsriTimesliderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriTimesliderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO WES: unit tests!
});
