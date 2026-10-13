import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {MapImportServiceAndUrlComponent} from './map-import-service-and-url.component';

describe('MapImportServiceAndUrlComponent', () => {
  let fixture: ComponentFixture<MapImportServiceAndUrlComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MapImportServiceAndUrlComponent], providers: [provideMockStore()]})
      .overrideComponent(MapImportServiceAndUrlComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MapImportServiceAndUrlComponent);
  });

  it('prevents native submit and validates the entered URL', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.serviceAndUrlForm.url().value.set('https://example.com/wms');
    const event = {preventDefault: vi.fn()} as unknown as Event;
    fixture.componentInstance.submit(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(dispatch).toHaveBeenCalledWith(MapImportActions.setUrl({url: 'https://example.com/wms'}));
  });

  it('does not validate an empty URL', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.serviceAndUrlForm.url().value.set('');
    dispatch.mockClear();
    fixture.componentInstance.validateUrl();
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({type: MapImportActions.setUrl.type}));
  });
});
