import {createFeature, createReducer, on} from '@ngrx/store';
import {StatisticsActions} from '../actions/statistics.actions';
import {StatisticsState} from '../states/statistics.state';
import {defaultStatisticsRadiusInMeters} from '../../../shared/configs/statistics.config';

export const statisticsFeatureKey = 'statistics';

export const initialState: StatisticsState = {
  mode: 'umkreis',
  radiusInMeters: defaultStatisticsRadiusInMeters,
  center: undefined,
  geometry: undefined,
  isUserDefined: false,
  loadingState: undefined,
  data: [],
};

export const statisticsFeature = createFeature({
  name: statisticsFeatureKey,
  reducer: createReducer(
    initialState,
    on(StatisticsActions.setSelection, (state, {geometry, center, radiusInMeters, isUserDefined}): StatisticsState => {
      // A new area invalidates the results loaded for the previous one, which is what lets the statistics tab detect on opening that
      // it has to load them for an area that was derived while the feature tab was active.
      return {
        ...state,
        geometry,
        center,
        radiusInMeters: radiusInMeters ?? state.radiusInMeters,
        isUserDefined,
        loadingState: undefined,
        data: [],
      };
    }),
    on(StatisticsActions.setMode, (state, {mode}): StatisticsState => {
      return {...state, mode};
    }),
    // Changing the radius is an explicit user decision, so the resulting area must survive a tab switch just like a drawn one.
    on(StatisticsActions.setRadius, (state, {radiusInMeters}): StatisticsState => {
      return {...state, radiusInMeters, isUserDefined: true};
    }),
    on(StatisticsActions.sendRequest, (state): StatisticsState => {
      return {...state, loadingState: 'loading', data: []};
    }),
    on(StatisticsActions.updateContent, (state, {results}): StatisticsState => {
      return {...state, loadingState: 'loaded', data: results};
    }),
    on(StatisticsActions.clearContent, (state): StatisticsState => {
      // The mode and radius are user settings and outlive a cleared result.
      return {...initialState, mode: state.mode, radiusInMeters: state.radiusInMeters};
    }),
    on(StatisticsActions.setError, (state): StatisticsState => {
      return {...state, loadingState: 'error', data: []};
    }),
  ),
});

export const {
  name,
  reducer,
  selectStatisticsState,
  selectMode,
  selectRadiusInMeters,
  selectCenter,
  selectGeometry,
  selectIsUserDefined,
  selectLoadingState,
  selectData,
} = statisticsFeature;
