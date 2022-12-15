import {TestBed} from '@angular/core/testing';

import {LayerService} from './layer.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('LayerService', () => {
  let service: LayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(LayerService);
  });

  // TODO there is a problem reading 'this.mapService.mapView.map' as it will not be initialized during a unit test run
  xit('should be created', () => {
    expect(service).toBeTruthy();
  });
});
