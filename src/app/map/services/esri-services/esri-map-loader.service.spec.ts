import {TestBed} from '@angular/core/testing';

import {EsriMapLoaderService} from './esri-map-loader.service';

describe('EsriMapLoaderService', () => {
  let service: EsriMapLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsriMapLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
