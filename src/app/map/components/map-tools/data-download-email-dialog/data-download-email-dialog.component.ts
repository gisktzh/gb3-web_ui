import {Component, inject} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';

@Component({
  selector: 'data-download-email-dialog',
  templateUrl: './data-download-email-dialog.component.html',
  styleUrls: ['./data-download-email-dialog.component.scss'],
  standalone: false,
})
export class DataDownloadEmailDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadEmailDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);
  private readonly data = inject<{
    orderEmail: string | undefined;
  }>(MAT_DIALOG_DATA);

  public emailFormControl: FormControl<string | null> = new FormControl(null, [Validators.required, Validators.email]);
  public isEmailActive: boolean = false;

  constructor() {
    const data = this.data;

    if (data.orderEmail) {
      this.emailFormControl.setValue(data.orderEmail);
      this.isEmailActive = true;
    }
  }

  public cancel() {
    this.close();
  }

  public download() {
    this.updateEmail();
    this.store.dispatch(DataDownloadOrderActions.sendOrder());
    this.close();
  }

  private close() {
    this.dialogRef.close();
  }

  public updateEmail() {
    let email = undefined;
    if (this.isEmailActive && this.emailFormControl.valid && this.emailFormControl.value?.trim() !== '') {
      email = this.emailFormControl.value?.trim();
    }
    this.store.dispatch(DataDownloadOrderActions.setEmailInOrder({email}));
  }
}
