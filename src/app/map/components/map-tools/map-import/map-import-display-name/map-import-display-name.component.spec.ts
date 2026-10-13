import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectTitle} from '../../../../../state/map/reducers/map-import.reducer';
import {MapImportDisplayNameComponent} from './map-import-display-name.component';

describe('MapImportDisplayNameComponent', () => {
  let fixture: ComponentFixture<MapImportDisplayNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [MapImportDisplayNameComponent], providers: [provideMockStore()]})
      .overrideComponent(MapImportDisplayNameComponent, {set: {template: '', imports: []}})
      .compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectTitle, 'External roads');
    fixture = TestBed.createComponent(MapImportDisplayNameComponent);
  });

  it('synchronizes the store title into the editable name', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.nameModel().name).toBe('External roads');
  });

  it('rejects an all-whitespace display name', () => {
    fixture.componentInstance.nameModel.set({name: '   '});
    expect(fixture.componentInstance.nameForm().valid()).toBe(false);
  });
});
