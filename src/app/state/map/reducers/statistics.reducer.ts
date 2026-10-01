import {createFeature, createReducer, on} from '@ngrx/store';
import {StatisticsActions} from '../actions/statistics.actions';
import {StatisticsState} from '../states/statistics.state';
import {defaultStatisticsRadiusInMeters} from '../../../shared/configs/statistics.config';
import {selectQueryPoint} from './query-location.reducer';

export const statisticsFeatureKey = 'statistics';

export const initialState: StatisticsState = {
  mode: 'umkreis',
  radiusInMeters: defaultStatisticsRadiusInMeters,
  geometry: undefined,
  areaInSquareMeters: undefined,
  loadingState: undefined,
  data: [],
  highlightedLayer: undefined,
};

export const statisticsFeature = createFeature({
  name: statisticsFeatureKey,
  reducer: createReducer(
    initialState,
    on(StatisticsActions.setSelection, (state, {geometry, radiusInMeters}): StatisticsState => {
      // A new area invalidates the results loaded for the previous one, which is what lets the statistics tab detect on opening that
      // it has to load them for an area that was derived while the feature tab was active.
      return {
        ...state,
        geometry,
        areaInSquareMeters: undefined,
        radiusInMeters: radiusInMeters ?? state.radiusInMeters,
        loadingState: undefined,
        data: [],
        highlightedLayer: undefined,
      };
    }),
    on(StatisticsActions.setMode, (state, {mode}): StatisticsState => {
      return {...state, mode};
    }),
    on(StatisticsActions.setRadius, (state, {radiusInMeters}): StatisticsState => {
      return {...state, radiusInMeters};
    }),
    on(StatisticsActions.setArea, (state, {areaInSquareMeters}): StatisticsState => {
      return {...state, areaInSquareMeters};
    }),
    on(StatisticsActions.sendRequest, (state): StatisticsState => {
      return {...state, loadingState: 'loading', data: [], highlightedLayer: undefined};
    }),
    on(StatisticsActions.invalidateContent, (state): StatisticsState => {
      return {...state, loadingState: undefined, data: [], highlightedLayer: undefined};
    }),
    on(StatisticsActions.updateContent, (state, {results}): StatisticsState => {
      return {...state, loadingState: 'loaded', data: results, highlightedLayer: undefined};
    }),
    on(StatisticsActions.clearContent, (state): StatisticsState => {
      // The mode and radius are user settings and outlive a cleared result.
      return {...initialState, mode: state.mode, radiusInMeters: state.radiusInMeters};
    }),
    on(StatisticsActions.setError, (state): StatisticsState => {
      return {...state, loadingState: 'error', data: [], highlightedLayer: undefined};
    }),
    on(StatisticsActions.highlightLayer, (state, {topic, layer}): StatisticsState => {
      return {...state, highlightedLayer: {topic, layer}};
    }),
    on(StatisticsActions.clearHighlight, (state): StatisticsState => {
      return {...state, highlightedLayer: undefined};
    }),
  ),
});

export const {
  name,
  reducer,
  selectStatisticsState,
  selectMode,
  selectRadiusInMeters,
  selectGeometry,
  selectAreaInSquareMeters,
  selectLoadingState,
  selectData,
  selectHighlightedLayer,
} = statisticsFeature;

export const selectCenter = selectQueryPoint;
