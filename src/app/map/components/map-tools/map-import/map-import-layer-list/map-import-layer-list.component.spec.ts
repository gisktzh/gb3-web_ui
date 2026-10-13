import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {MapImportLayerListComponent} from './map-import-layer-list.component';

describe('MapImportLayerListComponent', () => {
  let fixture: ComponentFixture<MapImportLayerListComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MapImportLayerListComponent], providers: [provideMockStore()]})
      .overrideComponent(MapImportLayerListComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MapImportLayerListComponent);
  });

  it('dispatches the selected external layer id', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.toggleSelection('roads');
    expect(dispatch).toHaveBeenCalledWith(MapImportActions.toggleLayerSelection({layerId: 'roads'}));
  });
});
