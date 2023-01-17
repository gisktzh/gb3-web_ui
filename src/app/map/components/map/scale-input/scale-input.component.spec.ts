import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleInputComponent} from './scale-input.component';

describe('ScaleInputComponent', () => {
  let component: ScaleInputComponent;
  let fixture: ComponentFixture<ScaleInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScaleInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScaleInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
