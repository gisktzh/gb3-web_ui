import {createFeature, createReducer, on} from '@ngrx/store';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';

export const mapAttributeFiltersItemFeatureKey = 'mapAttributeFiltersItem';

export interface MapAttributeFiltersItemState {
  mapAttributeFiltersItemId: string | undefined;
}

export const initialState: MapAttributeFiltersItemState = {
  mapAttributeFiltersItemId: undefined
};

export const mapAttributeFiltersItemFeature = createFeature({
  name: mapAttributeFiltersItemFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId, (state, {id}): MapAttributeFiltersItemState => {
      return {...initialState, mapAttributeFiltersItemId: id};
    }),
    on(MapAttributeFiltersItemActions.clearMapAttributeFiltersItemId, (): MapAttributeFiltersItemState => {
      return {...initialState};
    })
  )
});

export const {name, reducer, selectMapAttributeFiltersItemState, selectMapAttributeFiltersItemId} = mapAttributeFiltersItemFeature;
