import {TestBed} from '@angular/core/testing';

import {EsriMapViewService} from './esri-map-view.service';

describe('EsriMapViewService', () => {
  let service: EsriMapViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriMapViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
