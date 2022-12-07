import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MapOverlayListItemComponent} from './map-overlay-list-item.component';

describe('MapOverlayListItemComponent', () => {
  let component: MapOverlayListItemComponent;
  let fixture: ComponentFixture<MapOverlayListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapOverlayListItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapOverlayListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
