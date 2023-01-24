import {TestBed} from '@angular/core/testing';

import {BasemapConfigurationService} from './basemap-configuration.service';

describe('BasemapConfigurationService', () => {
  let service: BasemapConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasemapConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
