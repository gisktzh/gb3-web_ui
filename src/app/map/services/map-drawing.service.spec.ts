import {TestBed} from '@angular/core/testing';

import {MapDrawingService} from './map-drawing.service';

describe('MapDrawingService', () => {
  let service: MapDrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapDrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
