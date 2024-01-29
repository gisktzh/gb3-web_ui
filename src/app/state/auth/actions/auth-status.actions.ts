import {createActionGroup, emptyProps, props} from '@ngrx/store';

export const AuthStatusActions = createActionGroup({
  source: 'AuthStatus',
  events: {
    'Set Initial Data Loaded': emptyProps(),
    'Perform Login': emptyProps(),
    'Perform Logout': props<{isForced: boolean}>(),
    'Set Status': props<{isAuthenticated: boolean; userName?: string}>(),
  },
});
