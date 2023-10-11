import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MapToolsDesktopComponent} from './map-tools-desktop.component';

describe('MapToolsDesktopComponent', () => {
  let component: MapToolsDesktopComponent;
  let fixture: ComponentFixture<MapToolsDesktopComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapToolsDesktopComponent],
    });
    fixture = TestBed.createComponent(MapToolsDesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
