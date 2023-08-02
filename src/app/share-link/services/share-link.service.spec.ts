import {TestBed} from '@angular/core/testing';

import {ShareLinkService} from './share-link.service';

describe('ShareLinkService', () => {
  let service: ShareLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
