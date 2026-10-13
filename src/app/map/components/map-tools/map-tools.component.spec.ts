import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ConfigService} from '../../../shared/services/config.service';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {MapToolsDesktopComponent} from './map-tools-desktop/map-tools-desktop.component';
import {MapToolsMobileComponent} from './map-tools-mobile/map-tools-mobile.component';
import {MapToolsComponent} from './map-tools.component';

@Component({selector: 'map-tools-desktop', template: ''})
class MapToolsDesktopStubComponent {}

@Component({selector: 'map-tools-mobile', template: ''})
class MapToolsMobileStubComponent {}

describe('MapToolsComponent', () => {
  let fixture: ComponentFixture<MapToolsComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapToolsComponent],
      providers: [provideMockStore(), {provide: ConfigService, useValue: {tooltipConfig: {}}}],
    })
      .overrideComponent(MapToolsComponent, {
        remove: {imports: [MapToolsDesktopComponent, MapToolsMobileComponent]},
        add: {imports: [MapToolsDesktopStubComponent, MapToolsMobileStubComponent]},
      })
      .compileComponents();
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    fixture = TestBed.createComponent(MapToolsComponent);
    fixture.detectChanges();
  });

  it('renders the desktop tools outside mobile mode', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('map-tools-desktop')).toBeTruthy();
    expect(element.querySelector('map-tools-mobile')).toBeFalsy();
  });

  it('renders the mobile tools in mobile mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('map-tools-mobile')).toBeTruthy();
    expect(element.querySelector('map-tools-desktop')).toBeFalsy();
  });
});
