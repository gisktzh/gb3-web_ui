import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MobileWarningComponent} from './mobile-warning.component';

describe('MobileWarningComponent', () => {
  let component: MobileWarningComponent;
  let fixture: ComponentFixture<MobileWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MobileWarningComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
