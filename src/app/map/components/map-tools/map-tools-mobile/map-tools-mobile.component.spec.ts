import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {GeolocationActions} from '../../../../state/map/actions/geolocation.actions';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {MapToolsMobileComponent} from './map-tools-mobile.component';

describe('MapToolsMobileComponent', () => {
  let fixture: ComponentFixture<MapToolsMobileComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MapToolsMobileComponent], providers: [provideMockStore()]})
      .overrideComponent(MapToolsMobileComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MapToolsMobileComponent);
  });

  it('routes each mobile control to its store action', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.showShareLink();
    fixture.componentInstance.showLegend();
    fixture.componentInstance.locateClient();
    fixture.componentInstance.toggleBasemapSelection();
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showBottomSheet({bottomSheetContent: 'share-link'}));
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.setLegendOverlayVisibility({isVisible: true}));
    expect(dispatch).toHaveBeenCalledWith(GeolocationActions.startLocationRequest());
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showBottomSheet({bottomSheetContent: 'basemap'}));
  });
});
