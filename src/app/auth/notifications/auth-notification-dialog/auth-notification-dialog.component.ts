import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogContent} from '../auth-notification.service';

@Component({
  selector: 'app-auth-notification-dialog',
  templateUrl: './auth-notification-dialog.component.html',
  styleUrls: ['./auth-notification-dialog.component.scss'],
  standalone: false,
})
export class AuthNotificationDialogComponent {
  protected readonly data = inject<DialogContent>(MAT_DIALOG_DATA);
}
