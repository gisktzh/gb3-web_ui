import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {PageNotification, PageNotificationSeverity} from '../../interfaces/page-notification.interface';
import {Store} from '@ngrx/store';
import {PageNotificationActions} from '../../../state/app/actions/page-notification.actions';

@Component({
  selector: 'page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss'],
})
export class PageNotificationComponent {
  public readonly icon: string;
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: PageNotification,
    private readonly store: Store,
  ) {
    this.icon = this.transformSeverityToMatIconFont(data.severity);
  }

  public markPageNotificationAsRead() {
    this.store.dispatch(PageNotificationActions.markPageNotificationAsRead({id: this.data.id}));
  }

  private transformSeverityToMatIconFont(severity: PageNotificationSeverity): string {
    switch (severity) {
      case 'info':
        return 'ktzh_info_notification';
      case 'warning':
        return 'ktzh_caution';
    }
  }
}
