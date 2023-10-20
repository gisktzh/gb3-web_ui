import {createFeature, createReducer, on} from '@ngrx/store';
import {MapAttributeFiltersItemActions} from '../actions/map-attribute-filters-item.actions';
import {MapAttributeFiltersItemState} from '../states/map-attribute-filters-item.state';

export const mapAttributeFiltersItemFeatureKey = 'mapAttributeFiltersItem';

export const initialState: MapAttributeFiltersItemState = {
  id: undefined,
  title: '',
};

export const mapAttributeFiltersItemFeature = createFeature({
  name: mapAttributeFiltersItemFeatureKey,
  reducer: createReducer(
    initialState,
    on(MapAttributeFiltersItemActions.setMapAttributeFiltersItemId, (state, {id}): MapAttributeFiltersItemState => {
      return {...initialState, id: id};
    }),
    on(MapAttributeFiltersItemActions.clearMapAttributeFiltersItemId, (): MapAttributeFiltersItemState => {
      return {...initialState};
    }),
    on(MapAttributeFiltersItemActions.setMapAttributeFiltersItemTitle, (state, {title}): MapAttributeFiltersItemState => {
      return {...state, title: title};
    }),
  ),
});

export const {name, reducer, selectMapAttributeFiltersItemState, selectId, selectTitle} = mapAttributeFiltersItemFeature;
