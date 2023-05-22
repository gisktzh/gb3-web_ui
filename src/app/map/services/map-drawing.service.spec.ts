import {TestBed} from '@angular/core/testing';

import {MapDrawingService} from './map-drawing.service';
import {MAP_SERVICE} from '../../app.module';
import {EsriMapService} from './esri-services/esri-map.service';
import {provideMockStore} from '@ngrx/store/testing';

describe('MapDrawingService', () => {
  let service: MapDrawingService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideMockStore({}), {provide: MAP_SERVICE, useValue: EsriMapService}]});
    service = TestBed.inject(MapDrawingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
