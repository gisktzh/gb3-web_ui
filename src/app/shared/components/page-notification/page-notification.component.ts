import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {PageNotification, PageNotificationSeverity} from '../../interfaces/page-notification.interface';
import {Store} from '@ngrx/store';
import {PageNotificationActions} from '../../../state/app/actions/page-notification.actions';
import {Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';

@Component({
  selector: 'page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss'],
  standalone: false,
})
export class PageNotificationComponent implements OnInit, OnDestroy {
  public readonly data = inject<PageNotification>(MAT_SNACK_BAR_DATA);
  private readonly store = inject(Store);

  public readonly icon: string;
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor() {
    const data = this.data;

    this.icon = this.transformSeverityToMatIconFont(data.severity);
  }

  public ngOnInit(): void {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
