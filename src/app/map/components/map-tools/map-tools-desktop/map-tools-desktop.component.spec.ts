import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {MapToolsDesktopComponent} from './map-tools-desktop.component';

describe('MapToolsDesktopComponent', () => {
  let fixture: ComponentFixture<MapToolsDesktopComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MapToolsDesktopComponent], providers: [provideMockStore()]})
      .overrideComponent(MapToolsDesktopComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MapToolsDesktopComponent);
  });

  it('toggles a selected menu closed and another menu open', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    vi.spyOn(fixture.componentInstance, 'toolMenuVisibility').mockReturnValue('drawing');
    fixture.componentInstance.toggleToolMenu('drawing');
    fixture.componentInstance.toggleToolMenu('measurement');
    expect(dispatch).toHaveBeenNthCalledWith(1, MapUiActions.toggleToolMenu({tool: undefined}));
    expect(dispatch).toHaveBeenNthCalledWith(2, MapUiActions.toggleToolMenu({tool: 'measurement'}));
  });

  it('opens print, share and map import through store actions', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const event = {preventDefault: vi.fn()} as unknown as KeyboardEvent;
    fixture.componentInstance.showPrintDialog(event);
    fixture.componentInstance.showShareLinkDialog();
    fixture.componentInstance.showMapImportDialog();
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showMapSideDrawerContent({mapSideDrawerContent: 'print'}));
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showShareLinkDialog());
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showMapImportDialog());
  });
});
