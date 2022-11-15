import {createFeature, createReducer, on} from '@ngrx/store';
import {MapConfigurationActions} from '../actions/map-configuration.actions';
import {defaultMapConfig} from '../../../../shared/configs/map-config';

export const mapConfigurationFeatureKey = 'mapConfiguration';

export interface MapConfigurationState {
  center: __esri.Point;
  scale: number;
  srs: __esri.SpatialReference;
}

export const initialState: MapConfigurationState = {
  center: defaultMapConfig.defaultCenter,
  scale: defaultMapConfig.defaultScale,
  srs: defaultMapConfig.defaultSrs
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
