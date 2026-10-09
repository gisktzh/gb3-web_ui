import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {ExportFormat} from '../../../../shared/enums/export-format.enum';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {DrawingDownloadDialogComponent} from './drawing-download-dialog.component';

describe('DrawingDownloadDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  let fixture: ComponentFixture<DrawingDownloadDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DrawingDownloadDialogComponent],
      providers: [provideMockStore(), {provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(DrawingDownloadDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DrawingDownloadDialogComponent);
  });

  it('requests an export with the selected format', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    fixture.componentInstance.exportFormatModel.set({exportFormat: ExportFormat.Kml});
    fixture.componentInstance.downloadDrawings();
    expect(dispatch).toHaveBeenCalledWith(ExportActions.requestDrawingsExport({exportFormat: ExportFormat.Kml}));
  });

  it('closes when cancelled', () => {
    fixture.componentInstance.cancel();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
