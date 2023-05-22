import {PageNotificationAdapter} from '../adapters/page-notification.adapter';
import {createSelector} from '@ngrx/store';
import {selectPageNotificationState} from '../reducers/page-notification.reducer';

const {selectAll} = PageNotificationAdapter.getSelectors();
export const selectAllPageNotifications = createSelector(selectPageNotificationState, selectAll);
export const selectAllUnreadPageNotifications = createSelector(selectAllPageNotifications, (pageNotifications) =>
  pageNotifications.filter((pageNotification) => !pageNotification.isMarkedAsRead)
);
