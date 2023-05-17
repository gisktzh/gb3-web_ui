import {TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {provideMockStore} from '@ngrx/store/testing';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        provideMockStore({
          initialState: {
            pageNotification: {
              ids: [],
              entities: {}
            }
          }
        })
      ]
    }).compileComponents();
  });

  it('should compile', () => {});
});
