import {TestBed} from '@angular/core/testing';

import {EsriMapService} from './esri-map.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('EsriMapService', () => {
  let service: EsriMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(EsriMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
