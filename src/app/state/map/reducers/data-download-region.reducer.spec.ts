import {initialState, reducer} from './data-download-region.reducer';
import {DataDownloadRegionState} from '../states/data-download-region.state';
import {DataDownloadRegionActions} from '../actions/data-download-region.actions';
import {MinimalGeometriesUtils} from '../../../testing/map-testing/minimal-geometries.utils';
import {BoundingBoxWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';

describe('data download region reducer', () => {
  const existingStateMunicipalities: Municipality[] = [
    {
      bfsNo: 1,
      name: 'Kyoshi Island',
    },
    {
      bfsNo: 2,
      name: 'Omashu',
    },
    {
      bfsNo: 3,
      name: 'Ba Sing Se',
    },
    {
      bfsNo: 4,
      name: 'Southern Air Temple',
    },
    {
      bfsNo: 5,
      name: 'Northern Water Tribe',
    },
  ];
  const errorMock: Error = new Error('My cabbages!!!');
  let existingState: DataDownloadRegionState;

  beforeEach(() => {
    existingState = {
      federation: {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)},
      federationLoadingState: 'loaded',
      canton: {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)},
      cantonLoadingState: 'loaded',
      municipalities: existingStateMunicipalities,
      municipalitiesLoadingState: 'loaded',
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as never;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('loadFederation', () => {
    it('sets the federationLoadingState to `loading` if the federation is not loaded yet and resets the federation; keeps everything else', () => {
      existingState.federation = undefined;

      const action = DataDownloadRegionActions.loadFederation();
      const state = reducer(existingState, action);

      expect(state.federation).toEqual(initialState.federation);
      expect(state.federationLoadingState).toBe('loading');
      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });

    it('keeps everything as it is if there is already a federation', () => {
      const action = DataDownloadRegionActions.loadFederation();
      const state = reducer(existingState, action);

      expect(state.federation).toEqual(existingState.federation);
      expect(state.federationLoadingState).toBe(existingState.federationLoadingState);
      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('setFederation', () => {
    it('sets federationLoadingState to loaded and federation to the given value; keeps everything else', () => {
      existingState.federationLoadingState = 'loading';
      existingState.federation = undefined;
      const expectedFederation: BoundingBoxWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};

      const action = DataDownloadRegionActions.setFederation({federation: expectedFederation});
      const state = reducer(existingState, action);

      expect(state.federation).toEqual(expectedFederation);
      expect(state.federationLoadingState).toBe('loaded');
      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('setFederationError', () => {
    it('sets federationLoadingState to error and resets federation; keeps everything else', () => {
      const action = DataDownloadRegionActions.setFederationError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.federation).toEqual(initialState.federation);
      expect(state.federationLoadingState).toBe('error');
      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('loadCanton', () => {
    it('sets the cantonLoadingState to `loading` if there are no canton loaded yet and resets the canton; keeps everything else', () => {
      existingState.canton = undefined;

      const action = DataDownloadRegionActions.loadCanton();
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(initialState.canton);
      expect(state.cantonLoadingState).toBe('loading');
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });

    it('keeps everything as it is if there is already a canton', () => {
      const action = DataDownloadRegionActions.loadCanton();
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('setCanton', () => {
    it('sets cantonLoadingState to loaded and canton to the given value; keeps everything else', () => {
      existingState.cantonLoadingState = 'loading';
      existingState.canton = undefined;
      const expectedCanton: BoundingBoxWithGeometry = {boundingBox: MinimalGeometriesUtils.getMinimalPolygon(2056)};

      const action = DataDownloadRegionActions.setCanton({canton: expectedCanton});
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(expectedCanton);
      expect(state.cantonLoadingState).toBe('loaded');
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('setCantonError', () => {
    it('sets cantonLoadingState to error and resets canton; keeps everything else', () => {
      const action = DataDownloadRegionActions.setCantonError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(initialState.canton);
      expect(state.cantonLoadingState).toBe('error');
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('loadMunicipalities', () => {
    it('sets the municipalitiesLoadingState to `loading` if there are no municipalities loaded yet and resets the municipalities; keeps everything else', () => {
      existingState.municipalities = [];

      const action = DataDownloadRegionActions.loadMunicipalities();
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(initialState.municipalities);
      expect(state.municipalitiesLoadingState).toBe('loading');
    });

    it('keeps everything as it is if there are already municipalities', () => {
      const action = DataDownloadRegionActions.loadMunicipalities();
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(existingState.municipalities);
      expect(state.municipalitiesLoadingState).toBe(existingState.municipalitiesLoadingState);
    });
  });

  describe('setMunicipalities', () => {
    it('sets municipalitiesLoadingState to loaded and municipalities to the given value; keeps everything else', () => {
      existingState.municipalitiesLoadingState = 'loading';
      existingState.municipalities = [];
      const expectedMunicipalities: Municipality[] = [{bfsNo: 777, name: 'Spirit World'}];

      const action = DataDownloadRegionActions.setMunicipalities({municipalities: expectedMunicipalities});
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(expectedMunicipalities);
      expect(state.municipalitiesLoadingState).toBe('loaded');
    });
  });

  describe('setMunicipalitiesError', () => {
    it('sets municipalitiesLoadingState to error and resets municipalities; keeps everything else', () => {
      const action = DataDownloadRegionActions.setMunicipalitiesError({error: errorMock});
      const state = reducer(existingState, action);

      expect(state.canton).toEqual(existingState.canton);
      expect(state.cantonLoadingState).toBe(existingState.cantonLoadingState);
      expect(state.municipalities).toEqual(initialState.municipalities);
      expect(state.municipalitiesLoadingState).toBe('error');
    });
  });
});
