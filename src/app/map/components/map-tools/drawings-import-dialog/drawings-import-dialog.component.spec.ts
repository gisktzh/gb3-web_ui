import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ImportActions} from '../../../../state/map/actions/import.actions';
import {DrawingsImportDialogComponent} from './drawings-import-dialog.component';

describe('DrawingsImportDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  let fixture: ComponentFixture<DrawingsImportDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DrawingsImportDialogComponent],
      providers: [provideMockStore(), {provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(DrawingsImportDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DrawingsImportDialogComponent);
  });

  it('dispatches a drawing import for the chosen file', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    const file = new File(['{}'], 'drawing.geojson');
    fixture.componentInstance.handleFileChange(file);
    expect(dispatch).toHaveBeenCalledWith(ImportActions.requestDrawingsImport({file}));
  });

  it('keeps validation errors observable and resets state on cancel', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.handleFileError('Unsupported file');
    fixture.componentInstance.cancel();
    expect(dispatch).toHaveBeenCalledWith(ImportActions.setFileValidationError({errorMessage: 'Unsupported file'}));
    expect(dispatch).toHaveBeenCalledWith(ImportActions.resetDrawingImportState());
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
