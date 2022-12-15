import {TestBed} from '@angular/core/testing';

import {MapService} from './map.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
