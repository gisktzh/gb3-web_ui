import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ActiveMapItemsWidgetComponent} from './active-map-items-widget.component';
import {provideMockStore} from '@ngrx/store/testing';

describe('ActiveMapItemsWidgetComponent', () => {
  let component: ActiveMapItemsWidgetComponent;
  let fixture: ComponentFixture<ActiveMapItemsWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActiveMapItemsWidgetComponent],
      providers: [provideMockStore({})]
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveMapItemsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
