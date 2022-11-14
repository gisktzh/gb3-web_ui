import {createFeature, createReducer, on} from '@ngrx/store';
import {MapConfigurationActions} from '../actions/map-configuration.actions';
import {defaultCenter, defaultScale, defaultSrs} from '../../../../shared/configs/map-configs';

export const mapConfigurationFeatureKey = 'mapConfiguration';

export interface MapConfigurationState {
  center: __esri.Point;
  scale: number;
  srs: __esri.SpatialReference;
}

export const initialState: MapConfigurationState = {
  center: defaultCenter,
  scale: defaultScale,
  srs: defaultSrs
};

export const mapConfigurationFeature = createFeature({
  name: mapConfigurationFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapConfigurationActions.setMapExtent, (state, {center, scale}): MapConfigurationState => {
      return {...state, center, scale};
    })
  )
});

export const {name, reducer, selectMapConfigurationState, selectCenter, selectScale, selectSrs} = mapConfigurationFeature;
