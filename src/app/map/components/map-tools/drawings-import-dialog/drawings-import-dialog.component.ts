import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ConfigService} from '../../../../shared/services/config.service';
import {FileValidationError} from '../../../../shared/errors/file-upload.errors';

@Component({
  selector: 'drawings-import-dialog',
  templateUrl: './drawings-import-dialog.component.html',
  styleUrl: './drawings-import-dialog.component.scss',
})
export class DrawingsImportDialogComponent {
  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<DrawingsImportDialogComponent>,
    private readonly configService: ConfigService,
  ) {}
  public cancel() {
    this.dialogRef.close();
  }

  public handleFileChange(file: Blob | File) {
    console.log('File changed', file);
    // todo: dispatch action, set upload state, handle response and errors, close, etc.
  }

  public handleFileErrors(error: string) {
    throw new FileValidationError(error);
  }
}
