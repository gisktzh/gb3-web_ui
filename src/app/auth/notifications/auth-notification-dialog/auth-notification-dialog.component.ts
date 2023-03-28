import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogContent} from '../auth-notification.service';

@Component({
  selector: 'app-auth-notification-dialog',
  templateUrl: './auth-notification-dialog.component.html',
  styleUrls: ['./auth-notification-dialog.component.scss']
})
export class AuthNotificationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: DialogContent) {}
}
