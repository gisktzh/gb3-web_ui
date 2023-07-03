import {TestBed} from '@angular/core/testing';

import {EsriToolService} from './esri-tool.service';
import {provideMockStore} from '@ngrx/store/testing';
import {selectDrawingLayers} from '../../../../state/map/selectors/drawing-layers.selector';

describe('EsriToolService', () => {
  let service: EsriToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideMockStore({selectors: [{selector: selectDrawingLayers, value: []}]})]});
    service = TestBed.inject(EsriToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
