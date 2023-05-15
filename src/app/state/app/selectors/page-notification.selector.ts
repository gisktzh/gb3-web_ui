import {PageNotificationAdapter} from '../adapters/page-notification.adapter';
import {createSelector} from '@ngrx/store';
import {selectPageNotificationState} from '../reducers/page-notification.reducer';

const {selectIds, selectEntities, selectTotal, selectAll} = PageNotificationAdapter.getSelectors();

export const selectPageNotificationIds = createSelector(selectPageNotificationState, selectIds);

export const selectPageNotificationEntities = createSelector(selectPageNotificationState, selectEntities);

export const selectAllPageNotifications = createSelector(selectPageNotificationState, selectAll);

export const selectPageNotificationTotal = createSelector(selectPageNotificationState, selectTotal);
