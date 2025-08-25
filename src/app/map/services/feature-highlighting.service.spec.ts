import {TestBed} from '@angular/core/testing';

import {FeatureHighlightingService} from './feature-highlighting.service';
import {provideMockStore} from '@ngrx/store/testing';
import {MapServiceStub} from '../../testing/map-testing/map.service.stub';
import {MAP_SERVICE} from '../../app.tokens';

describe('FeatureHighlightingService', () => {
  let service: FeatureHighlightingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FeatureHighlightingService, provideMockStore({}), {provide: MAP_SERVICE, useClass: MapServiceStub}],
    });
    service = TestBed.inject(FeatureHighlightingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
