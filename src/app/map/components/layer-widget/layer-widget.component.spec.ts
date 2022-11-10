import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LayerWidgetComponent} from './layer-widget.component';

describe('LayerWidgetComponent', () => {
  let component: LayerWidgetComponent;
  let fixture: ComponentFixture<LayerWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerWidgetComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
