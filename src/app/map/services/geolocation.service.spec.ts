import {TestBed} from '@angular/core/testing';

import {GeolocationService} from './geolocation.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('GeolocationService', () => {
  let service: GeolocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideMockStore({})]});
    service = TestBed.inject(GeolocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
