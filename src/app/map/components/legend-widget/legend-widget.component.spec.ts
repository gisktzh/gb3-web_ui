import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LegendWidgetComponent} from './legend-widget.component';
import {provideMockStore} from '@ngrx/store/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('LegendWidgetComponent', () => {
  let component: LegendWidgetComponent;
  let fixture: ComponentFixture<LegendWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LegendWidgetComponent],
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    }).compileComponents();

    fixture = TestBed.createComponent(LegendWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
