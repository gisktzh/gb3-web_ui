import {TestBed} from '@angular/core/testing';

import {BasemapConfigService} from './basemap-config.service';

describe('BasemapConfigurationService', () => {
  let service: BasemapConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BasemapConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
