import {Component} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';

@Component({
  selector: 'data-download-email-dialog',
  templateUrl: './data-download-email-dialog.component.html',
  styleUrls: ['./data-download-email-dialog.component.scss'],
})
export class DataDownloadEmailDialogComponent {
  public emailFormControl: FormControl<string | null> = new FormControl(null, [Validators.required, Validators.email]);
  public isEmailActive: boolean = false;

  constructor(
    private readonly dialogRef: MatDialogRef<DataDownloadEmailDialogComponent>,
    private readonly store: Store,
  ) {}

  public cancel() {
    this.close();
  }

  public download() {
    this.store.dispatch(DataDownloadOrderActions.sendOrder());
    this.close();
  }

  private close() {
    this.dialogRef.close();
  }

  public setIsEmailActive(isEmailActive: boolean) {
    this.isEmailActive = isEmailActive;
    this.updateEmail();
  }

  public updateEmail() {
    let email = undefined;
    if (this.isEmailActive && this.emailFormControl.valid && this.emailFormControl.value?.trim() !== '') {
      email = this.emailFormControl.value?.trim();
    }
    console.log(`email: ${email}`);
    this.store.dispatch(DataDownloadOrderActions.setEmailInOrder({email}));
  }
}
