import {Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'data-download-email-confirmation-dialog',
  templateUrl: './data-download-email-confirmation-dialog.component.html',
  styleUrls: ['./data-download-email-confirmation-dialog.component.scss'],
  standalone: false,
})
export class DataDownloadEmailConfirmationDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadEmailConfirmationDialogComponent>>(MatDialogRef);

  public close() {
    this.dialogRef.close();
  }
}
