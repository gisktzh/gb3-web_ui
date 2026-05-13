import {Component, inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarLabel, MatSnackBarActions} from '@angular/material/snack-bar';
import {PageNotification, PageNotificationSeverity} from '../../interfaces/page-notification.interface';
import {Store} from '@ngrx/store';
import {PageNotificationActions} from '../../../state/app/actions/page-notification.actions';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

function getIconBySeverity(severity: PageNotificationSeverity) {
  switch (severity) {
    case 'info':
      return 'ktzh_info_notification';
    case 'warning':
      return 'ktzh_caution';
  }
}

@Component({
  selector: 'page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss'],
  imports: [MatSnackBarLabel, MatIcon, MatSnackBarActions, MatIconButton],
})
export class PageNotificationComponent {
  public readonly data = inject<PageNotification>(MAT_SNACK_BAR_DATA);
  private readonly store = inject(Store);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly icon = getIconBySeverity(this.data.severity);

  public markPageNotificationAsRead() {
    this.store.dispatch(PageNotificationActions.markPageNotificationAsRead({id: this.data.id}));
  }
}
