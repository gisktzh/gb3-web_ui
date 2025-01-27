import {createSelector} from '@ngrx/store';
import {selectExternalApps} from '../reducers/external-apps.reducer';
import {ExternalApp} from '../../../shared/interfaces/external-app.interface';
import {selectAccessMode} from '../../app/reducers/app.reducer';

export const selectExternalAppsForAccessMode = createSelector(
  selectExternalApps,
  selectAccessMode,
  (externalApps, accessMode): ExternalApp[] => {
    return externalApps.filter(({visibility}) => visibility === accessMode || visibility === 'both');
  },
);
