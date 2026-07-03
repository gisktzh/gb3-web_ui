import {Component, computed, effect, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {form, required, email, FormField} from '@angular/forms/signals';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatLabel, MatInput, MatError} from '@angular/material/input';

import {MatButton} from '@angular/material/button';
import {selectUserEmail} from '../../../../state/auth/reducers/auth-status.reducer';

@Component({
  selector: 'data-download-email-dialog',
  templateUrl: './data-download-email-dialog.component.html',
  styleUrls: ['./data-download-email-dialog.component.scss'],
  imports: [ApiDialogWrapperComponent, MatCheckbox, FormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, FormField],
})
export class DataDownloadEmailDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadEmailDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);
  private readonly data = inject<{
    orderEmail: string | undefined;
  }>(MAT_DIALOG_DATA);

  public readonly emailModel = signal<{email: string}>({
    email: '',
  });
  public emailForm = form(this.emailModel, (fieldPath) => {
    required(fieldPath.email, {
      when: () => this.emailRequested(),
    });
    email(fieldPath.email);
  });
  public readonly userEmail = this.store.selectSignal(selectUserEmail);
  public readonly emailRequested = signal(false);
  public readonly isEmailActive = computed(() => {
    return !!this.data.orderEmail || !!(this.data.orderEmail && this.userEmail()) || this.emailRequested();
  });

  constructor() {
    if (this.data.orderEmail) {
      this.emailModel.set({email: this.data.orderEmail});
    }

    effect(() => {
      const userEmail = this.userEmail();
      if (userEmail) {
        queueMicrotask(() => {
          this.emailModel.set({email: userEmail});
        });
      }
    });
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
    let emailValue = undefined;
    if (this.emailForm().valid()) {
      emailValue = this.emailModel().email;
    }

    this.store.dispatch(DataDownloadOrderActions.setEmailInOrder({email: emailValue}));
  }
}
