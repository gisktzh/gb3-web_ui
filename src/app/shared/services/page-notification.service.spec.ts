import {TestBed} from '@angular/core/testing';

import {PageNotificationService} from './page-notification.service';

describe('PageNotificationService', () => {
  let service: PageNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
