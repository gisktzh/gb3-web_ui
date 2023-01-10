import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrintOverlayComponent} from './print-overlay.component';

describe('PrintOverlayComponent', () => {
  let component: PrintOverlayComponent;
  let fixture: ComponentFixture<PrintOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintOverlayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
