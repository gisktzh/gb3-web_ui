import * as fromReducer from '../../data-catalogue/reducers/data-catalogue.reducer';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewMetadataItem,
} from '../../../shared/models/overview-metadata-item.model';
import {DataCatalogueState} from '../states/data-catalogue.state';

describe('DataCatalogue Reducer', () => {
  describe('loadCatalogue', () => {
    it('sets the loading state to loading on initial load', () => {
      const {initialState} = fromReducer;
      const action = DataCatalogueActions.loadCatalogue();

      const state = fromReducer.reducer(initialState, action);

      expect(state.loadingState).toEqual('loading');
    });

    it('returns an empty items array if loading state is undefined and items are present', () => {
      const existingState: DataCatalogueState = {loadingState: 'undefined', items: [{} as OverviewMetadataItem]};
      const action = DataCatalogueActions.loadCatalogue();

      const state = fromReducer.reducer(existingState, action);

      expect(state.items).toEqual([]);
    });

    it('returns existing items if loading state is loaded', () => {
      const existingState: DataCatalogueState = {loadingState: 'loaded', items: [{} as OverviewMetadataItem]};
      const action = DataCatalogueActions.loadCatalogue();

      const state = fromReducer.reducer(existingState, action);

      expect(state.items).toEqual([{} as OverviewMetadataItem]);
    });
  });

  describe('setError', () => {
    it('sets loading state to error and returns empty state', () => {
      const existingState: DataCatalogueState = {loadingState: 'loaded', items: [{} as OverviewMetadataItem]};
      const action = DataCatalogueActions.setError({});

      const state = fromReducer.reducer(existingState, action);

      expect(state.loadingState).toEqual('error');
      expect(state.items).toEqual([]);
    });
  });

  describe('setCatalogue', () => {
    it('sets the catalogue items and the loadingstate', () => {
      const {initialState} = fromReducer;
      const mockItems = [new MapOverviewMetadataItem(1, 'test1', 'testtest1'), new DatasetOverviewMetadataItem(2, 'test2', 'testtest2')];
      const action = DataCatalogueActions.setCatalogue({items: mockItems});

      const state = fromReducer.reducer(initialState, action);

      expect(state.loadingState).toEqual('loaded');
      expect(state.items).toEqual(jasmine.arrayWithExactContents(mockItems));
    });
  });
});
