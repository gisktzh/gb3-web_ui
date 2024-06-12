import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {ExportFormat} from '../../../../shared/types/export-format.type';

@Component({
  selector: 'drawing-download-dialog',
  templateUrl: './drawing-download-dialog.component.html',
  styleUrl: './drawing-download-dialog.component.scss',
})
export class DrawingDownloadDialogComponent {
  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<DrawingDownloadDialogComponent>,
  ) {}

  public downloadDrawings(exportFormat: ExportFormat) {
    this.store.dispatch(ExportActions.requestDrawingsExport({exportFormat}));
  }

  public cancel() {
    this.dialogRef.close();
  }
}
