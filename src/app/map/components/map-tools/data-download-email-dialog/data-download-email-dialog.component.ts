import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatLabel, MatInput, MatError} from '@angular/material/input';
import {NgClass} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {selectUserEmail} from '../../../../state/auth/reducers/auth-status.reducer';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'data-download-email-dialog',
  templateUrl: './data-download-email-dialog.component.html',
  styleUrls: ['./data-download-email-dialog.component.scss'],
  imports: [
    ApiDialogWrapperComponent,
    MatCheckbox,
    FormsModule,
    MatFormField,
    NgClass,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatError,
    MatButton,
  ],
})
export class DataDownloadEmailDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject<MatDialogRef<DataDownloadEmailDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);
  private readonly data = inject<{
    orderEmail: string | undefined;
  }>(MAT_DIALOG_DATA);
  private readonly userEmail$ = this.store.select(selectUserEmail);
  public userEmail?: string = undefined;
  private readonly subscriptions = new Subscription();

  public emailFormControl: FormControl<string | null> = new FormControl(null, [Validators.required, Validators.email]);
  public isEmailActive: boolean = false;

  constructor() {
    if (this.data.orderEmail) {
      this.emailFormControl.setValue(this.data.orderEmail);
      this.isEmailActive = true;
    }
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.userEmail$
        .pipe(
          tap((userEmail) => {
            if (userEmail && !this.data.orderEmail) {
              this.emailFormControl.setValue(userEmail);
              this.isEmailActive = true;
            }
          }),
        )
        .subscribe(),
    );
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
