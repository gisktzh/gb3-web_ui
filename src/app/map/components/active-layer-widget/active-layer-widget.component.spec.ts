import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ActiveLayerWidgetComponent} from './active-layer-widget.component';

describe('ActiveLayerWidgetComponent', () => {
  let component: ActiveLayerWidgetComponent;
  let fixture: ComponentFixture<ActiveLayerWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveLayerWidgetComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveLayerWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
