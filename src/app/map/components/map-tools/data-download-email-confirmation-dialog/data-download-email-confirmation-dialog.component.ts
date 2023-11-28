import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'data-download-email-confirmation-dialog',
  templateUrl: './data-download-email-confirmation-dialog.component.html',
  styleUrls: ['./data-download-email-confirmation-dialog.component.scss'],
})
export class DataDownloadEmailConfirmationDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<DataDownloadEmailConfirmationDialogComponent>) {}

  public close() {
    this.dialogRef.close();
  }
}
