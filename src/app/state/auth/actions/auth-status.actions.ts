import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {MapRestoreItem} from '../../../shared/interfaces/map-restore-item.interface';

export const AuthStatusActions = createActionGroup({
  source: 'AuthStatus',
  events: {
    'Set Initial Data Loaded': emptyProps(),
    'Perform Login': emptyProps(),
    'Perform Logout': props<{isForced: boolean}>(),
    'Set Status': props<{isAuthenticated: boolean; userName?: string}>(),
    'Set Restore Application Error': errorProps(),
    'Complete Restore Application': props<{mapRestoreItem: MapRestoreItem}>(),
  },
});
