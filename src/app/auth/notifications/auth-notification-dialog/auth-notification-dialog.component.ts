import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose} from '@angular/material/dialog';
import {DialogContent} from '../auth-notification.service';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-auth-notification-dialog',
  templateUrl: './auth-notification-dialog.component.html',
  styleUrls: ['./auth-notification-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
})
export class AuthNotificationDialogComponent {
  protected readonly data = inject<DialogContent>(MAT_DIALOG_DATA);
}
