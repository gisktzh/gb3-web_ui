import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {MapImportDialogComponent} from './map-import-dialog.component';

describe('MapImportDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  let fixture: ComponentFixture<MapImportDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MapImportDialogComponent],
      providers: [provideMockStore(), {provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(MapImportDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(MapImportDialogComponent);
  });

  it('clears import state when cancelled', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.cancel();
    expect(dispatch).toHaveBeenCalledWith(MapImportActions.clearAll());
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('imports the configured map and closes when finished', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.finish();
    expect(dispatch).toHaveBeenCalledWith(MapImportActions.importExternalMapItem());
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
