import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {PageNotification, PageNotificationSeverity} from '../../interfaces/page-notification.interface';

@Component({
  selector: 'page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss']
})
export class PageNotificationComponent {
  public readonly icon: string;
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: PageNotification,
    private matSnackBarRef: MatSnackBarRef<PageNotificationComponent>
  ) {
    this.icon = this.transformSeverityToMatIconFont(data.severity);
  }

  public close() {
    this.matSnackBarRef.dismiss();
  }

  private transformSeverityToMatIconFont(severity: PageNotificationSeverity): string {
    switch (severity) {
      case 'info':
        return 'info';
      case 'warning':
        return 'error';
    }
  }
}
