import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {PageNotification} from '../../interfaces/page-notification.interface';

@Component({
  selector: 'page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss']
})
export class PageNotificationComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: PageNotification,
    private matSnackBarRef: MatSnackBarRef<PageNotificationComponent>
  ) {}

  public close() {
    this.matSnackBarRef.dismiss();
  }
}
