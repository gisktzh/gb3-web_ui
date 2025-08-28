import {Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'data-download-email-confirmation-dialog',
  templateUrl: './data-download-email-confirmation-dialog.component.html',
  styleUrls: ['./data-download-email-confirmation-dialog.component.scss'],
  imports: [ApiDialogWrapperComponent, MatIcon, MatButton],
})
export class DataDownloadEmailConfirmationDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadEmailConfirmationDialogComponent>>(MatDialogRef);

  public close() {
    this.dialogRef.close();
  }
}
