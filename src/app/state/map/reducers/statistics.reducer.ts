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
  loadingState: undefined,
  data: [],
};

export const statisticsFeature = createFeature({
  name: statisticsFeatureKey,
  reducer: createReducer(
    initialState,
    on(StatisticsActions.setSelection, (state, {geometry, center, radiusInMeters}): StatisticsState => {
      // A new area invalidates the results loaded for the previous one, which is what lets the statistics tab detect on opening that
      // it has to load them for an area that was derived while the feature tab was active.
      return {
        ...state,
        geometry,
        center,
        radiusInMeters: radiusInMeters ?? state.radiusInMeters,
        loadingState: undefined,
        data: [],
      };
    }),
    on(StatisticsActions.setMode, (state, {mode}): StatisticsState => {
      return {...state, mode};
    }),
    on(StatisticsActions.setRadius, (state, {radiusInMeters}): StatisticsState => {
      return {...state, radiusInMeters};
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
  selectLoadingState,
  selectData,
} = statisticsFeature;
