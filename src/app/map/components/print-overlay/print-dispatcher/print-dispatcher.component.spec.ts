import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PrintDispatcherComponent} from './print-dispatcher.component';

describe('PrintDispatcherComponent', () => {
  let component: PrintDispatcherComponent;
  let fixture: ComponentFixture<PrintDispatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrintDispatcherComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintDispatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
