import {createFeature, createReducer, on} from '@ngrx/store';
import {PageNotificationState} from '../states/page-notification.state';
import {PageNotificationActions} from '../actions/page-notification.actions';
import {PageNotificationAdapter} from '../adapters/page-notification.adapter';

export const pageNotificationFeatureKey = 'pageNotification';

export const initialState: PageNotificationState = PageNotificationAdapter.getInitialState({
  loadingState: undefined,
});

export const pageNotificationFeature = createFeature({
  name: pageNotificationFeatureKey,
  reducer: createReducer(
    initialState,
    on(PageNotificationActions.loadPageNotifications, (state): PageNotificationState => {
      return {...state, loadingState: 'loading'};
    }),
    on(PageNotificationActions.setPageNotifications, (state, {pageNotifications}): PageNotificationState => {
      return PageNotificationAdapter.setMany(pageNotifications, {...state, loadingState: 'loaded'});
    }),
    on(PageNotificationActions.markPageNotificationAsRead, (state, {id}): PageNotificationState => {
      return PageNotificationAdapter.updateOne({id: id, changes: {isMarkedAsRead: true}}, state);
    }),
  ),
});

export const {name, reducer, selectPageNotificationState} = pageNotificationFeature;
