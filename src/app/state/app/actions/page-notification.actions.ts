import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {PageNotification} from '../../../shared/interfaces/page-notification.interface';

export const PageNotificationActions = createActionGroup({
  source: 'PageNotification',
  events: {
    'Load Page Notifications': emptyProps(),
    'Set Page Notifications': props<{pageNotifications: PageNotification[]}>(),
    'Mark Page Notification As Read': props<{id: string}>()
  }
});
