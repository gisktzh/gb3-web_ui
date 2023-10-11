import * as fromReducer from '../../data-catalogue/reducers/data-catalogue.reducer';
import {DataCatalogueActions} from '../actions/data-catalogue.actions';
import {
  DatasetOverviewMetadataItem,
  MapOverviewMetadataItem,
  OverviewMetadataItem,
} from '../../../shared/models/overview-metadata-item.model';
import {DataCatalogueState} from '../states/data-catalogue.state';
import {DataCatalogueFilter} from '../../../shared/interfaces/data-catalogue-filter.interface';

describe('DataCatalogue Reducer', () => {
  describe('loadCatalogue', () => {
    it('sets the loading state to loading on initial load', () => {
      const {initialState} = fromReducer;
      const action = DataCatalogueActions.loadCatalogue();

      const state = fromReducer.reducer(initialState, action);

      expect(state.loadingState).toEqual('loading');
    });

    it('returns an empty items array if loading state is undefined and items are present', () => {
      const existingState: DataCatalogueState = {loadingState: undefined, items: [{} as OverviewMetadataItem], filters: []};
      const action = DataCatalogueActions.loadCatalogue();

      const state = fromReducer.reducer(existingState, action);

      expect(state.items).toEqual([]);
    });

    it('returns existing items if loading state is loaded', () => {
      const existingState: DataCatalogueState = {loadingState: 'loaded', items: [{} as OverviewMetadataItem], filters: []};
      const action = DataCatalogueActions.loadCatalogue();

      const state = fromReducer.reducer(existingState, action);

      expect(state.items).toEqual([{} as OverviewMetadataItem]);
    });
  });

  describe('setError', () => {
    it('sets loading state to error and returns empty state', () => {
      const existingState: DataCatalogueState = {loadingState: 'loaded', items: [{} as OverviewMetadataItem], filters: []};
      const action = DataCatalogueActions.setError({});

      const state = fromReducer.reducer(existingState, action);

      expect(state.loadingState).toEqual('error');
      expect(state.items).toEqual([]);
    });
  });

  describe('setCatalogue', () => {
    it('sets the catalogue items and the loadingstate', () => {
      const {initialState} = fromReducer;
      const mockItems = [
        new MapOverviewMetadataItem('1', 'test1', 'testtest1', 'testDep'),
        new DatasetOverviewMetadataItem('2', 'test2', 'testtest2', 'testDep', 'testOut'),
      ];
      const action = DataCatalogueActions.setCatalogue({items: mockItems});

      const state = fromReducer.reducer(initialState, action);

      expect(state.loadingState).toEqual('loaded');
      expect(state.items).toEqual(jasmine.arrayWithExactContents(mockItems));
    });
  });

  describe('setFilters', () => {
    it('sets the filters', () => {
      const {initialState} = fromReducer;
      const filters: DataCatalogueFilter[] = [
        {
          filterValues: [
            {value: 'A', isActive: false},
            {value: 'B', isActive: false},
          ],
          label: 'AA',
          key: 'outputFormat',
        },
        {
          filterValues: [
            {value: 'C', isActive: false},
            {value: 'D', isActive: false},
          ],
          label: 'CC',
          key: 'name',
        },
      ];
      const action = DataCatalogueActions.setFilters({dataCatalogueFilters: filters});

      const state = fromReducer.reducer(initialState, action);

      expect(state.filters).toEqual(filters);
    });
  });

  describe('resetFilters', () => {
    it('resets all active filters', () => {
      const {initialState} = fromReducer;
      const filters: DataCatalogueFilter[] = [
        {
          filterValues: [
            {value: 'A', isActive: true},
            {value: 'B', isActive: false},
          ],
          label: 'AA',
          key: 'outputFormat',
        },
        {
          filterValues: [
            {value: 'C', isActive: false},
            {value: 'D', isActive: true},
          ],
          label: 'CC',
          key: 'name',
        },
      ];
      const action = DataCatalogueActions.resetFilters();

      const state = fromReducer.reducer({...initialState, filters}, action);

      const activeStates = state.filters.flatMap((f) => f.filterValues.flatMap((fv) => fv.isActive));
      expect(activeStates).not.toContain(true);
    });
  });

  describe('toggleFilter', () => {
    it('sets an active filter to inactive', () => {
      const {initialState} = fromReducer;
      const filters: DataCatalogueFilter[] = [
        {
          filterValues: [
            {value: 'A', isActive: true},
            {value: 'B', isActive: true},
          ],
          label: 'AA',
          key: 'outputFormat',
        },
        {
          filterValues: [
            {value: 'C', isActive: true},
            {value: 'D', isActive: true},
          ],
          label: 'CC',
          key: 'name',
        },
      ];
      const action = DataCatalogueActions.toggleFilter({key: 'outputFormat', value: 'B'});

      const state = fromReducer.reducer({...initialState, filters}, action);

      const expected: DataCatalogueFilter[] = [
        {
          filterValues: [
            {value: 'A', isActive: true},
            {value: 'B', isActive: false},
          ],
          label: 'AA',
          key: 'outputFormat',
        },
        {
          filterValues: [
            {value: 'C', isActive: true},
            {value: 'D', isActive: true},
          ],
          label: 'CC',
          key: 'name',
        },
      ];
      expect(state.filters).toEqual(expected);
    });

    it('sets an inactive filter to active', () => {
      const {initialState} = fromReducer;
      const filters: DataCatalogueFilter[] = [
        {
          filterValues: [
            {value: 'A', isActive: false},
            {value: 'B', isActive: false},
          ],
          label: 'AA',
          key: 'outputFormat',
        },
        {
          filterValues: [
            {value: 'C', isActive: false},
            {value: 'D', isActive: false},
          ],
          label: 'CC',
          key: 'name',
        },
      ];
      const action = DataCatalogueActions.toggleFilter({key: 'outputFormat', value: 'B'});

      const state = fromReducer.reducer({...initialState, filters}, action);

      const expected: DataCatalogueFilter[] = [
        {
          filterValues: [
            {value: 'A', isActive: false},
            {value: 'B', isActive: true},
          ],
          label: 'AA',
          key: 'outputFormat',
        },
        {
          filterValues: [
            {value: 'C', isActive: false},
            {value: 'D', isActive: false},
          ],
          label: 'CC',
          key: 'name',
        },
      ];
      expect(state.filters).toEqual(expected);
    });
  });
});
