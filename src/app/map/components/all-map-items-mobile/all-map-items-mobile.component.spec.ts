import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AllMapItemsMobileComponent} from './all-map-items-mobile.component';

describe('AllMapItemsMobileComponent', () => {
  let component: AllMapItemsMobileComponent;
  let fixture: ComponentFixture<AllMapItemsMobileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllMapItemsMobileComponent],
    });
    fixture = TestBed.createComponent(AllMapItemsMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
