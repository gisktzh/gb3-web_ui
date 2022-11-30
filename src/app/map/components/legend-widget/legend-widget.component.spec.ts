import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LegendWidgetComponent} from './legend-widget.component';

describe('LegendWidgetComponent', () => {
  let component: LegendWidgetComponent;
  let fixture: ComponentFixture<LegendWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegendWidgetComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LegendWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
