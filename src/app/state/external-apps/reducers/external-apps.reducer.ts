import {createFeature, createReducer} from '@ngrx/store';
import {ExternalAppsState} from '../states/external-apps.state';
import {externalAppsData} from '../../../shared/data/external-apps.data';

export const externalAppsFeatureKey = 'externalApps';

export const initialState: ExternalAppsState = {
  externalApps: externalAppsData,
};

export const externalAppsFeature = createFeature({
  name: externalAppsFeatureKey,
  reducer: createReducer(initialState),
});

export const {name, reducer, selectExternalApps} = externalAppsFeature;
