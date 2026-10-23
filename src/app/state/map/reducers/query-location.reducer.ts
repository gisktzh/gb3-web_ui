import {createFeature, createReducer, on} from '@ngrx/store';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {QueryLocationActions} from '../actions/query-location.actions';
import {MapConfigActions} from '../actions/map-config.actions';

export interface QueryLocationState {
  point: PointWithSrs | undefined;
}

export const initialState: QueryLocationState = {point: undefined};

export const queryLocationFeature = createFeature({
  name: 'queryLocation',
  reducer: createReducer(
    initialState,
    on(QueryLocationActions.setPoint, (_, {point}): QueryLocationState => ({point})),
    on(MapConfigActions.clearFeatureInfoContent, (): QueryLocationState => initialState),
  ),
});

export const {reducer, selectPoint: selectQueryPoint} = queryLocationFeature;
