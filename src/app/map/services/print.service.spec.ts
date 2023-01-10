import {TestBed} from '@angular/core/testing';
import {provideMockStore} from '@ngrx/store/testing';
import {PrintService} from './print.service';

describe('PrintService', () => {
  let service: PrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({})]
    });
    service = TestBed.inject(PrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
